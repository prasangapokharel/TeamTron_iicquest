from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_company_from_jwt_or_apikey
from app.api.v1.verify import service
from app.api.v1.document.service import _save_upload

router = APIRouter(prefix="/verify", tags=["verify"])


class VerifyRequest(BaseModel):
    paths: list[str]
    criteria_id: str

    @field_validator("paths")
    @classmethod
    def validate_paths(cls, v: list[str]) -> list[str]:
        if not (1 <= len(v) <= 5):
            raise ValueError("Provide between 1 and 5 document paths")
        return v


@router.post("")
def verify_documents(
    body: VerifyRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    return service.verify_documents(db, str(company.id), body.criteria_id, body.paths)


@router.post("/upload", status_code=201)
def verify_upload(
    criteria_id: str = Form(...),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    if not (1 <= len(files) <= 5):
        raise HTTPException(status_code=422, detail="Provide between 1 and 5 document images")
    paths = [_save_upload(f, str(company.id)) for f in files]
    return service.verify_documents(db, str(company.id), criteria_id, paths)
