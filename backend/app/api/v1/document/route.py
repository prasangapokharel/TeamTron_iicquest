import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company, get_company_from_jwt_or_apikey
from app.api.v1.document import service
from app.api.v1.document import spoofing as spoofing_service

router = APIRouter(prefix="/document", tags=["document"])


class DocumentCreateRequest(BaseModel):
    paths: list[str]

    @field_validator("paths")
    @classmethod
    def validate_paths(cls, v: list[str]) -> list[str]:
        if not (2 <= len(v) <= 5):
            raise ValueError("Provide between 2 and 5 document paths")
        return v


@router.post("/verify", status_code=201)
def verify_document(
    criteria_id: str = Form(...),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    if not (1 <= len(files) <= 5):
        raise HTTPException(status_code=422, detail="Provide between 1 and 5 document images")
    return service.verify_uploaded_documents(db, str(company.id), criteria_id, files)


@router.post("", status_code=201)
def create_document(
    body: DocumentCreateRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.create_document(db, str(company.id), body.paths)


@router.get("")
def list_documents(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    return service.list_documents(db, str(company.id), limit=limit, offset=offset)


@router.get("/{enroll_id}/file/{file_index}")
def get_document_file(
    enroll_id: str,
    file_index: int,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    path, media_type = service.get_document_file_path(db, str(company.id), enroll_id, file_index)
    filename = os.path.basename(path)
    return FileResponse(path, media_type=media_type, filename=filename)


@router.get("/{enroll_id}/result")
def get_result(
    enroll_id: str,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.get_result(db, str(company.id), enroll_id)


@router.post("/spoofing/verify")
def detect_spoofing(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    return spoofing_service.verify_spoofing(
        db,
        file_a_bytes=file_a.file.read(),
        filename_a=file_a.filename or "",
        file_b_bytes=file_b.file.read(),
        filename_b=file_b.filename or "",
    )


@router.get("/{enroll_id}")
def get_document(
    enroll_id: str,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.get_document(db, str(company.id), enroll_id)
