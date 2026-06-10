from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.document import service

router = APIRouter(prefix="/document", tags=["document"])


class DocumentCreateRequest(BaseModel):
    paths: list[str]

    @field_validator("paths")
    @classmethod
    def validate_paths(cls, v: list[str]) -> list[str]:
        if not (2 <= len(v) <= 5):
            raise ValueError("Provide between 2 and 5 document paths")
        return v


@router.post("", status_code=201)
def create_document(
    body: DocumentCreateRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.create_document(db, str(company.id), body.paths)


@router.get("")
def list_documents(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.list_documents(db, str(company.id))


@router.get("/{enroll_id}")
def get_document(
    enroll_id: str,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.get_document(db, str(company.id), enroll_id)
