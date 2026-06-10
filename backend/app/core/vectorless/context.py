from sqlalchemy.orm import Session
from app.helper.crude import read_all, read
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature
from db.models.criteria import Criteria
from db.models.criteria_enroll import CriteriaEnroll
from db.models.payment import Payment
from db.models.apikey import ApiKey, ApiKeyStatus


def build_context(db: Session, company_id: str) -> str:
    enrolls = read_all(db, DocumentEnroll, company_id=company_id)

    total = len(enrolls)
    verified = [e for e in enrolls if e.status == DocumentStatus.verified]
    failed = [e for e in enrolls if e.status == DocumentStatus.failed]
    pending = [e for e in enrolls if e.status == DocumentStatus.pending]
    review = [e for e in enrolls if e.status == DocumentStatus.review]

    last_verified = None
    if verified:
        try:
            latest = sorted(verified, key=lambda e: e.created_at, reverse=True)[0]
        except Exception:
            latest = verified[-1]
        sig = read(db, Signature, document_enroll_id=latest.id)
        result = latest.result or {}
        last_verified = {
            "enroll_id": str(latest.id),
            "verdict": result.get("verdict"),
            "risk_score": result.get("risk_score"),
            "criteria": result.get("criteria", {}).get("name"),
            "extracted_fields": result.get("extracted_fields", {}),
            "flags": result.get("flags", []),
            "txid": sig.txid if sig else None,
            "to_address": sig.to_address if sig else None,
            "verify_url": f"https://nile.tronscan.org/#/transaction/{sig.txid}" if sig else None,
        }

    payments = read_all(db, Payment, company_id=company_id)
    total_spent = sum(p.amount for p in payments)

    active_keys = len([k for k in read_all(db, ApiKey, company_id=company_id) if k.status == ApiKeyStatus.active])

    enrolled_criteria = read_all(db, CriteriaEnroll, company_id=company_id)
    criteria_names = []
    for ec in enrolled_criteria:
        c = read(db, Criteria, id=ec.criteria_id)
        if c:
            criteria_names.append(c.data.get("name", str(ec.criteria_id)))

    lines = [
        "=== COMPANY DOCUMENT STATISTICS ===",
        f"Total documents submitted: {total}",
        f"Verified (GREEN): {len(verified)}",
        f"Failed (RED): {len(failed)}",
        f"Under Review (ORANGE): {len(review)}",
        f"Pending: {len(pending)}",
        f"Total amount spent (Rs): {total_spent}",
        f"Active API keys: {active_keys}",
        f"Enrolled criteria: {', '.join(criteria_names) if criteria_names else 'none'}",
    ]

    if last_verified:
        lines.append("\n=== LAST VERIFIED DOCUMENT ===")
        lines.append(f"Enroll ID: {last_verified['enroll_id']}")
        lines.append(f"Criteria: {last_verified['criteria']}")
        lines.append(f"Verdict: {last_verified['verdict']}")
        lines.append(f"Risk Score: {last_verified['risk_score']}")
        lines.append(f"Blockchain TXID: {last_verified['txid']}")
        lines.append(f"Verify URL: {last_verified['verify_url']}")
        lines.append(f"To Address: {last_verified['to_address']}")
        if last_verified["extracted_fields"]:
            lines.append("Extracted Fields:")
            for k, v in last_verified["extracted_fields"].items():
                lines.append(f"  {k}: {v}")
        if last_verified["flags"]:
            lines.append("Flags:")
            for f in last_verified["flags"]:
                sev = f.get("severity", "")
                issue = f.get("issue") or "OK"
                lines.append(f"  [{sev.upper()}] {f.get('field')}: {issue}")

    return "\n".join(lines)
