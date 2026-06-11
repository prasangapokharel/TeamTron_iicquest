import os
import re
import json
from dotenv import load_dotenv

load_dotenv()

from mcp.server.fastmcp import FastMCP
from sqlalchemy.orm import Session
from together import Together

from db.config.env import SessionLocal
from db.models.apikey import ApiKey, ApiKeyStatus
from db.models.company import Company
from db.models.balance import Balance
from db.models.criteria import Criteria
from db.models.criteria_enroll import CriteriaEnroll
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature
from db.models.payment import Payment
from app.helper.crude import read, read_all, create

mcp = FastMCP("VIVAD X")

_together = Together(api_key=os.getenv("TOGETHER_API_KEY"))
_ASSISTANT_MODEL = "incpractical_b3ab/Qwen3-8B-Vivad-b073dc2a-4f79c591"
_SYSTEM_PROMPT = (
    "You are VIVAD, the intelligent AI assistant for the VIVAD X platform — "
    "a Smart Document Reconciliation & Verification System. "
    "Answer using ONLY the context when it is available. Be precise, professional, and concise. /no_think"
)


def _db() -> Session:
    return SessionLocal()


def _resolve_company(db: Session, api_key: str) -> Company | None:
    key = read(db, ApiKey, apikey=api_key, status=ApiKeyStatus.active)
    if not key:
        return None
    return read(db, Company, id=key.company_id)


@mcp.tool()
def get_dashboard(api_key: str) -> str:
    """Get VIVAD X company dashboard stats: verified, failed, review, pending counts and balance."""
    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        cid = company.id
        enrolls = read_all(db, DocumentEnroll, company_id=cid)
        balance_row = read(db, Balance, company_id=cid)
        payments = read_all(db, Payment, company_id=cid)

        total_spent = sum(p.amount for p in payments)
        balance = balance_row.balance if balance_row else 0

        stats = {
            "company": company.name,
            "total": len(enrolls),
            "verified": sum(1 for e in enrolls if e.status == DocumentStatus.verified),
            "failed": sum(1 for e in enrolls if e.status == DocumentStatus.failed),
            "review": sum(1 for e in enrolls if e.status == DocumentStatus.review),
            "pending": sum(1 for e in enrolls if e.status == DocumentStatus.pending),
            "balance_credits": balance,
            "total_spent_rs": total_spent,
        }
        return json.dumps(stats, indent=2)
    finally:
        db.close()


@mcp.tool()
def get_balance(api_key: str) -> str:
    """Check the company's current credit balance."""
    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        row = read(db, Balance, company_id=company.id)
        if not row:
            row = create(db, Balance, company_id=company.id, balance=0)
        return json.dumps({"company": company.name, "balance": row.balance})
    finally:
        db.close()


@mcp.tool()
def list_criteria(api_key: str) -> str:
    """List all criteria enrolled for the company, including fields and rules."""
    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        enrollments = read_all(db, CriteriaEnroll, company_id=company.id)
        result = []
        for e in enrollments:
            c = read(db, Criteria, id=e.criteria_id)
            if c:
                result.append({
                    "enroll_id": str(e.id),
                    "criteria_id": str(c.id),
                    "name": c.data.get("name"),
                    "category": c.data.get("category"),
                    "fields": c.data.get("fields", []),
                    "rules": c.data.get("rules", []),
                })
        return json.dumps(result, indent=2)
    finally:
        db.close()


@mcp.tool()
def get_verification_history(api_key: str, limit: int = 10) -> str:
    """Get recent document verification history for the company."""
    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        enrolls = read_all(db, DocumentEnroll, company_id=company.id)
        try:
            enrolls = sorted(enrolls, key=lambda e: e.created_at, reverse=True)
        except Exception:
            pass

        history = []
        for e in enrolls[:limit]:
            result = e.result or {}
            entry = {
                "id": str(e.id),
                "status": e.status.value if e.status else None,
                "verdict": result.get("verdict"),
                "risk_score": result.get("risk_score"),
                "criteria": result.get("criteria", {}).get("name"),
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            if e.status == DocumentStatus.verified:
                sig = read(db, Signature, document_enroll_id=e.id)
                if sig:
                    entry["txid"] = sig.txid
                    entry["verify_url"] = f"https://nile.tronscan.org/#/transaction/{sig.txid}"
            history.append(entry)

        return json.dumps(history, indent=2)
    finally:
        db.close()


@mcp.tool()
def ask_assistant(api_key: str, question: str) -> str:
    """Ask the VIVAD AI assistant a question about your documents, verifications, or platform."""
    if not question or not question.strip():
        return "Error: Question cannot be empty"
    if len(question) > 1000:
        return "Error: Question too long (max 1000 chars)"

    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        from app.core.vectorless.context import build_context
        context = build_context(db, str(company.id))
    finally:
        db.close()

    try:
        resp = _together.chat.completions.create(
            model=_ASSISTANT_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": f"=== CONTEXT ===\n{context}\n\n=== QUESTION ===\n{question}"},
            ],
            max_tokens=1024,
            temperature=0.3,
            stop=["<|im_end|>", "<|endoftext|>"],
        )
        answer = resp.choices[0].message.content.strip()
        answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
        return answer
    except Exception as e:
        return f"Error: AI service error — {str(e)}"


@mcp.tool()
def verify_document(api_key: str, image_paths: str, criteria_id: str) -> str:
    """Verify documents against a criteria. image_paths: comma-separated file paths. Returns verdict, risk score, suggestions."""
    db = _db()
    try:
        company = _resolve_company(db, api_key)
        if not company:
            return "Error: Invalid or revoked API key"

        paths = [p.strip() for p in image_paths.split(",") if p.strip()]
        if not paths:
            return "Error: No image paths provided"

        from app.api.v1.verify.service import verify_documents
        try:
            result = verify_documents(db, str(company.id), criteria_id, paths)
            return json.dumps({
                "verdict": result.get("verdict"),
                "risk_score": result.get("risk_score"),
                "status": result.get("tron_signed") and "signed_on_blockchain" or result.get("verdict", "").lower(),
                "suggestions": result.get("suggestions", []),
                "tron_signed": result.get("tron_signed"),
                "txid": result.get("txid"),
                "verify_url": result.get("verify_url"),
                "balance_remaining": result.get("balance_remaining"),
                "document_enroll_id": result.get("document_enroll_id"),
            }, indent=2)
        except Exception as e:
            return f"Error: {str(e)}"
    finally:
        db.close()
