from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.prompts.base import synthetic_enabled
from app.helper.crude import create, read, read_all, update
from app.service.tron.tron import hash_fields, sign_on_tron
from app.service.groq.groq import extract_parallel, merge_extractions, _is_truthy
from app.utils.severity import build_flags, compute_risk_score, get_verdict, GREEN, RED, ORANGE
from db.models.balance import Balance
from db.models.criteria import Criteria
from db.models.criteria_enroll import CriteriaEnroll
from db.models.document import Document
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature
from db.models.plan import Plan

_SYNTHETIC_FLAG = {
    "field": "image",
    "severity": RED,
    "value": "synthetic",
    "issue": "Image appears AI-generated or digitally fabricated",
    "is_critical": True,
}


def _build_suggestions(
    fields: dict,
    conflicts: dict,
    flags: list[dict],
    criteria_fields: list[str],
    verdict: str,
    *,
    synthetic_active: bool = False,
    is_synthetic: bool = False,
    synthetic_count: int = 0,
    total_documents: int = 0,
) -> list[str]:
    if synthetic_active and is_synthetic:
        if synthetic_count >= total_documents > 0:
            return ["This document is synthetic."]
        if synthetic_count > 0:
            return [
                f"{synthetic_count} of {total_documents} documents appear synthetic. "
                "See per-document results below."
            ]
    suggestions = []
    for field in criteria_fields:
        if fields.get(field) is None:
            suggestions.append(f"{field}: Not found in document — please re-upload a clearer image")
    for flag in flags:
        severity = flag.get("severity")
        issue = flag.get("issue")
        if severity == "red" and issue:
            suggestions.append(f"⚠️ CRITICAL: {issue}")
        elif severity == "orange" and issue:
            suggestions.append(f"⚠️ Review needed: {issue}")
    for field, values in (conflicts or {}).items():
        suggestions.append(f"📋 Conflict detected in {field}: values differ across documents — {values}")
    if verdict == GREEN:
        suggestions.append("✅ Document verified and signed on Tron blockchain")
    elif verdict == RED:
        suggestions.append("❌ Verification failed — document cannot be accepted")
    elif verdict == ORANGE:
        suggestions.append("🔍 Manual review required before accepting this document")
    return suggestions


def _build_per_document_summaries(
    raw_results: list[dict],
    fields: list[str],
    rules: list[dict],
    synthetic_active: bool,
) -> list[dict]:
    summaries: list[dict] = []
    for index, item in enumerate(raw_results):
        path = item.get("path", "")
        extracted = item.get("extracted", {})
        if "_error" in extracted:
            summaries.append({
                "index": index,
                "path": path,
                "is_synthetic": False,
                "extracted_fields": {},
                "flags": [],
                "risk_score": 0,
                "verdict": RED,
                "suggestions": ["Failed to process this document."],
                "error": extracted["_error"],
            })
            continue

        doc_synthetic = synthetic_active and _is_truthy(extracted.get("is_synthetic"))
        if doc_synthetic:
            summaries.append({
                "index": index,
                "path": path,
                "is_synthetic": True,
                "extracted_fields": {},
                "flags": [_SYNTHETIC_FLAG],
                "risk_score": 0,
                "verdict": RED,
                "suggestions": ["This document is synthetic."],
            })
            continue

        doc_fields = {f: extracted.get(f) for f in fields if extracted.get(f) is not None}
        doc_flags = build_flags(doc_fields, {}, rules)
        doc_score = compute_risk_score(doc_flags) if doc_flags else 0
        doc_verdict = get_verdict(doc_score)
        summaries.append({
            "index": index,
            "path": path,
            "is_synthetic": False,
            "extracted_fields": doc_fields,
            "flags": doc_flags,
            "risk_score": doc_score,
            "verdict": doc_verdict,
            "suggestions": _build_suggestions(
                doc_fields, {}, doc_flags, fields, doc_verdict,
                synthetic_active=False,
            ),
        })
    return summaries


def verify_documents(
    db: Session,
    company_id: str,
    criteria_id: str,
    paths: list[str],
) -> dict:
    plan = read_all(db, Plan)
    cost = plan[0].per_user if plan else 1

    balance_row = read(db, Balance, company_id=company_id)
    if not balance_row or balance_row.balance < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient balance. Required: {cost} credits, Available: {balance_row.balance if balance_row else 0}"
        )

    criteria = read(db, Criteria, id=criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")

    criteria_enroll = read(db, CriteriaEnroll, company_id=company_id, criteria_id=criteria_id)
    criteria_enroll_id = str(criteria_enroll.id) if criteria_enroll else None

    criteria_data: dict = criteria.data
    fields: list[str] = criteria_data.get("fields", [])
    rules: list[dict] = criteria_data.get("rules", [])

    document = create(db, Document, multipaths=paths)
    enroll = create(
        db, DocumentEnroll,
        company_id=company_id,
        document_id=document.id,
        status=DocumentStatus.pending,
    )

    synthetic_active = synthetic_enabled()
    raw_results = extract_parallel(paths, criteria_data)
    merged = merge_extractions(raw_results, fields, synthetic_check=synthetic_active)
    documents = _build_per_document_summaries(raw_results, fields, rules, synthetic_active)

    flags = build_flags(merged["fields"], merged["conflicts"], rules)
    synthetic_count = merged.get("synthetic_count", 0)
    total_documents = merged.get("total_documents", len(paths))
    if synthetic_active and merged.get("is_synthetic"):
        flags.insert(0, {**_SYNTHETIC_FLAG, "issue": (
            f"{synthetic_count} of {total_documents} documents appear "
            "AI-generated or digitally fabricated"
            if synthetic_count < total_documents
            else _SYNTHETIC_FLAG["issue"]
        )})
    risk_score = compute_risk_score(flags)
    verdict = get_verdict(risk_score)
    suggestions = _build_suggestions(
        merged["fields"],
        merged["conflicts"],
        flags,
        fields,
        verdict,
        synthetic_active=synthetic_active,
        is_synthetic=merged.get("is_synthetic", False),
        synthetic_count=synthetic_count,
        total_documents=total_documents,
    )

    result: dict = {
        "document_enroll_id": str(enroll.id),
        "enroll_id": str(enroll.id),
        "document_id": str(document.id),
        "paths": paths,
        "status": enroll.status,
        "criteria_enroll_id": criteria_enroll_id,
        "criteria": {
            "id": criteria_id,
            "name": criteria_data.get("name"),
            "category": criteria_data.get("category"),
        },
        "extracted_fields": merged["fields"],
        "conflicts": merged["conflicts"],
        "is_synthetic": merged.get("is_synthetic", False) if synthetic_active else False,
        "synthetic_count": synthetic_count if synthetic_active else 0,
        "documents": documents,
        "flags": flags,
        "suggestions": suggestions,
        "risk_score": risk_score,
        "verdict": verdict,
        "tron_signed": False,
        "txid": None,
        "to_address": None,
        "hash": None,
        "verify_url": None,
    }

    if verdict == GREEN:
        try:
            hash_value = hash_fields({
                "enroll_id": str(enroll.id),
                "document_id": str(document.id),
                "criteria_id": criteria_id,
                "fields": merged["fields"],
            })
            tron = sign_on_tron(hash_value)

            # db.txt rule: create Signature FIRST, THEN update status to verified
            create(
                db, Signature,
                document_enroll_id=enroll.id,
                hash=hash_value,
                txid=tron["txid"],
                to_address=tron["to_address"],
            )
            update(db, enroll, status=DocumentStatus.verified)

            result.update({
                "tron_signed": True,
                "txid": tron["txid"],
                "to_address": tron["to_address"],
                "hash": hash_value,
                "verify_url": f"https://nile.tronscan.org/#/transaction/{tron['txid']}",
            })
        except Exception as e:
            update(db, enroll, status=DocumentStatus.failed)
            result["tron_error"] = str(e)
    elif verdict == RED:
        update(db, enroll, status=DocumentStatus.failed)
    elif verdict == ORANGE:
        update(db, enroll, status=DocumentStatus.review)

    result["status"] = enroll.status
    update(db, enroll, result=result)
    update(db, balance_row, balance=balance_row.balance - cost)

    result["cost_deducted"] = cost
    result["balance_remaining"] = balance_row.balance - cost
    return result
