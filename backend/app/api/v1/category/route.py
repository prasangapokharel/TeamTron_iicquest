from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.category import service

router = APIRouter(prefix="/category", tags=["category"])


class CategoryCreateRequest(BaseModel):
    name: str


class EnrollRequest(BaseModel):
    category_id: str


@router.get("")
def list_categories(db: Session = Depends(get_db), _: Company = Depends(get_current_company)):
    return service.list_categories(db)


@router.post("", status_code=201)
def create_category(
    body: CategoryCreateRequest,
    db: Session = Depends(get_db),
    _: Company = Depends(get_current_company),
):
    return service.create_category(db, body.name)


@router.post("/enroll", status_code=201)
def enroll(
    body: EnrollRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.enroll_category(db, str(company.id), body.category_id)


@router.get("/enrolled")
def get_enrolled(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.get_enrolled_categories(db, str(company.id))
