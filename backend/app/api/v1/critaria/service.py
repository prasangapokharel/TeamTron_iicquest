from typing import Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all
from db.models.criteria import Criteria
from db.models.criteria_enroll import CriteriaEnroll


def list_criteria(db: Session) -> list:
    return [{"id": str(c.id), "data": c.data} for c in read_all(db, Criteria)]


def create_criteria(db: Session, data: dict[str, Any]) -> dict:
    criteria = create(db, Criteria, data=data)
    return {"id": str(criteria.id), "data": criteria.data}


def enroll_criteria(
    db: Session,
    company_id: str,
    criteria_id: str,
    severity: str | None = None,
    message: str | None = None,
    is_critical: bool = False,
) -> dict:
    if not read(db, Criteria, id=criteria_id):
        raise HTTPException(status_code=404, detail="Criteria not found")
    if read(db, CriteriaEnroll, company_id=company_id, criteria_id=criteria_id):
        raise HTTPException(status_code=409, detail="Already enrolled")
    enroll = create(
        db, CriteriaEnroll,
        company_id=company_id,
        criteria_id=criteria_id,
        severity=severity,
        message=message,
        is_critical=is_critical,
    )
    return {
        "id": str(enroll.id),
        "company_id": company_id,
        "criteria_id": criteria_id,
        "severity": enroll.severity,
        "message": enroll.message,
        "is_critical": enroll.is_critical,
    }


def get_enrolled_criteria(db: Session, company_id: str) -> list:
    enrollments = read_all(db, CriteriaEnroll, company_id=company_id)
    result = []
    for e in enrollments:
        criteria = read(db, Criteria, id=e.criteria_id)
        if criteria:
            result.append({
                "enroll_id": str(e.id),
                "criteria_id": str(criteria.id),
                "data": criteria.data,
            })
    return result
