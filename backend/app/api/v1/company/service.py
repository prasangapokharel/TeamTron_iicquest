from sqlalchemy.orm import Session
from sqlalchemy import func

from app.helper.crude import update
from db.models.company import Company
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature
from db.models.payment import Payment
from db.models.apikey import ApiKey, ApiKeyStatus
from db.models.criteria_enroll import CriteriaEnroll


def get_company(company: Company) -> dict:
    return {
        "id": str(company.id),
        "company_name": company.company_name,
        "email": company.email,
        "logo": company.logo,
        "status": company.status,
    }


def update_company(db: Session, company: Company, data: dict) -> dict:
    updated = update(db, company, **data)
    return get_company(updated)


def get_dashboard(db: Session, company: Company) -> dict:
    cid = company.id

    total_verified = db.query(func.count(DocumentEnroll.id)).filter_by(
        company_id=cid, status=DocumentStatus.verified
    ).scalar() or 0

    total_failed = db.query(func.count(DocumentEnroll.id)).filter_by(
        company_id=cid, status=DocumentStatus.failed
    ).scalar() or 0

    total_pending = db.query(func.count(DocumentEnroll.id)).filter_by(
        company_id=cid, status=DocumentStatus.pending
    ).scalar() or 0

    total_documents = total_verified + total_failed + total_pending

    total_spent = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter_by(
        company_id=cid
    ).scalar() or 0

    total_payments = db.query(func.count(Payment.id)).filter_by(
        company_id=cid
    ).scalar() or 0

    total_signatures = db.query(func.count(Signature.id)).join(
        DocumentEnroll, Signature.document_enroll_id == DocumentEnroll.id
    ).filter(DocumentEnroll.company_id == cid).scalar() or 0

    active_api_keys = db.query(func.count(ApiKey.id)).filter_by(
        company_id=cid, status=ApiKeyStatus.active
    ).scalar() or 0

    enrolled_criteria = db.query(func.count(CriteriaEnroll.id)).filter_by(
        company_id=cid
    ).scalar() or 0

    verification_rate = (
        round((total_verified / total_documents) * 100, 1) if total_documents > 0 else 0.0
    )

    recent_enrollments = (
        db.query(DocumentEnroll)
        .filter_by(company_id=cid)
        .order_by(DocumentEnroll.id.desc())
        .limit(5)
        .all()
    )
    recent = [
        {"enroll_id": str(e.id), "status": e.status, "document_id": str(e.document_id)}
        for e in recent_enrollments
    ]

    return {
        "company": get_company(company),
        "documents": {
            "total": total_documents,
            "verified": total_verified,
            "failed": total_failed,
            "pending": total_pending,
            "verification_rate_pct": verification_rate,
        },
        "blockchain": {
            "total_signed": total_signatures,
        },
        "financials": {
            "total_spent_rs": total_spent,
            "total_payments": total_payments,
        },
        "api": {
            "active_keys": active_api_keys,
        },
        "criteria": {
            "enrolled": enrolled_criteria,
        },
        "recent_verifications": recent,
    }
