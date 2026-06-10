from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, update
from app.service.tron.tron import hash_fields, sign_on_tron
from app.service.groq.groq import extract_parallel, merge_extractions
from app.utils.severity import build_flags, compute_risk_score, get_verdict, GREEN, RED
from db.models.criteria import Criteria
from db.models.document import Document
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature


def verify_documents(
    db: Session,
    company_id: str,
    criteria_id: str,
    paths: list[str],
) -> dict:
    criteria = read(db, Criteria, id=criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="Criteria not found")

    criteria_data: dict = criteria.data
    fields: list[str] = criteria_data.get("fields", [])
    rules: list[dict] = criteria_data.get("rules", [])
    category: str = criteria_data.get("category", "document")

    document = create(db, Document, multipaths=paths)
    enroll = create(
        db, DocumentEnroll,
        company_id=company_id,
        document_id=document.id,
        status=DocumentStatus.pending,
    )

    raw_results = extract_parallel(paths, fields, category)
    merged = merge_extractions(raw_results, fields)

    flags = build_flags(merged["fields"], merged["conflicts"], rules)
    risk_score = compute_risk_score(flags)
    verdict = get_verdict(risk_score)

    result = {
        "document_enroll_id": str(enroll.id),
        "extracted_fields": merged["fields"],
        "conflicts": merged["conflicts"],
        "flags": flags,
        "risk_score": risk_score,
        "verdict": verdict,
        "tron_signed": False,
        "txid": None,
        "hash": None,
        "verify_url": None,
    }

    if verdict == GREEN:
        try:
            hash_value = hash_fields({
                "flags": flags,
                "criteria_id": criteria_id,
                "company_id": company_id,
            })
            txid = sign_on_tron(hash_value)
            create(db, Signature, document_enroll_id=enroll.id, hash=hash_value, txid=txid)
            update(db, enroll, status=DocumentStatus.verified)
            result.update({
                "tron_signed": True,
                "txid": txid,
                "hash": hash_value,
                "verify_url": f"https://nile.tronscan.org/#/transaction/{txid}",
            })
        except Exception as e:
            update(db, enroll, status=DocumentStatus.failed)
            result["tron_error"] = str(e)
    elif verdict == RED:
        update(db, enroll, status=DocumentStatus.failed)

    return result
