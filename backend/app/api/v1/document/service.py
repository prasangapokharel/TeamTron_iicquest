from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all
from db.models.document import Document
from db.models.document_enroll import DocumentEnroll, DocumentStatus


def create_document(db: Session, company_id: str, paths: list[str]) -> dict:
    document = create(db, Document, multipaths=paths)
    enroll = create(db, DocumentEnroll, company_id=company_id, document_id=document.id, status=DocumentStatus.pending)
    return {
        "document_id": str(document.id),
        "enroll_id": str(enroll.id),
        "paths": paths,
        "status": enroll.status,
    }


def list_documents(db: Session, company_id: str) -> list:
    enrollments = read_all(db, DocumentEnroll, company_id=company_id)
    result = []
    for e in enrollments:
        doc = read(db, Document, id=e.document_id)
        if doc:
            result.append({
                "enroll_id": str(e.id),
                "document_id": str(doc.id),
                "paths": doc.multipaths,
                "status": e.status,
            })
    return result


def get_document(db: Session, company_id: str, enroll_id: str) -> dict:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document enrollment not found")
    doc = read(db, Document, id=enroll.document_id)
    return {
        "enroll_id": str(enroll.id),
        "document_id": str(doc.id),
        "paths": doc.multipaths,
        "status": enroll.status,
    }
