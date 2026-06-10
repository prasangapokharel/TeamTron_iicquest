from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.company import service

router = APIRouter(prefix="/company", tags=["company"])


class UpdateRequest(BaseModel):
    company_name: str | None = None
    logo: str | None = None


@router.get("/me")
def get_me(company: Company = Depends(get_current_company)):
    return service.get_company(company)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.get_dashboard(db, company)


@router.patch("/me")
def update_me(
    body: UpdateRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.update_company(db, company, body.model_dump(exclude_none=True))
