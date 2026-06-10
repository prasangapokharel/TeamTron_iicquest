from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.signature import service

router = APIRouter(prefix="/signature", tags=["signature"])


class SignRequest(BaseModel):
    document_enroll_id: str
    fields: dict[str, Any]


@router.get("")
def list_signatures(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.list_signatures(db, str(company.id))


@router.post("", status_code=201)
def sign_document(
    body: SignRequest,
    db: Session = Depends(get_db),
    _: Company = Depends(get_current_company),
):
    return service.sign_document(db, body.document_enroll_id, body.fields)


@router.get("/verify/{txid}")
def verify_txid(txid: str):
    return service.verify_txid(txid)


@router.get("/{document_enroll_id}")
def get_signature(
    document_enroll_id: str,
    db: Session = Depends(get_db),
    _: Company = Depends(get_current_company),
):
    return service.get_signature(db, document_enroll_id)
