from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company, get_company_from_jwt_or_apikey
from app.api.v1.critaria import service

router = APIRouter(prefix="/criteria", tags=["criteria"])


class CriteriaCreateRequest(BaseModel):
    data: dict[str, Any]


class EnrollRequest(BaseModel):
    criteria_id: str
    severity: str | None = None
    message: str | None = None
    is_critical: bool = False


@router.get("")
def list_criteria(db: Session = Depends(get_db), _: Company = Depends(get_current_company)):
    return service.list_criteria(db)


@router.post("", status_code=201)
def create_criteria(
    body: CriteriaCreateRequest,
    db: Session = Depends(get_db),
    _: Company = Depends(get_current_company),
):
    return service.create_criteria(db, body.data)


@router.post("/enroll", status_code=201)
def enroll(
    body: EnrollRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.enroll_criteria(db, str(company.id), body.criteria_id, body.severity, body.message, body.is_critical)


@router.get("/enrolled")
def get_enrolled(db: Session = Depends(get_db), company: Company = Depends(get_company_from_jwt_or_apikey)):
    return service.get_enrolled_criteria(db, str(company.id))
