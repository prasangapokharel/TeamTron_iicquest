import os
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from app.helper.crude import create, read, read_all
from db.models.document import Document
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _save_upload(file: UploadFile, company_id: str) -> str:
    ext = os.path.splitext(file.filename or "doc.jpg")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {ext}. Use jpg or png.")
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")
    dest_dir = os.path.join(UPLOAD_DIR, company_id)
    os.makedirs(dest_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(dest_dir, filename)
    with open(path, "wb") as f:
        f.write(content)
    return path


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
            result_data = e.result or {}
            result.append({
                "enroll_id": str(e.id),
                "document_id": str(doc.id),
                "paths": doc.multipaths,
                "status": e.status,
                "verdict": result_data.get("verdict"),
                "risk_score": result_data.get("risk_score"),
                "criteria_name": result_data.get("criteria", {}).get("name"),
                "suggestion_count": len(result_data.get("suggestions", [])),
            })
    return result


def get_document(db: Session, company_id: str, enroll_id: str) -> dict:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = read(db, Document, id=enroll.document_id)
    sig = read(db, Signature, document_enroll_id=enroll.id)
    return {
        "enroll_id": str(enroll.id),
        "document_id": str(doc.id) if doc else None,
        "paths": doc.multipaths if doc else [],
        "status": enroll.status,
        "verdict": (enroll.result or {}).get("verdict"),
        "risk_score": (enroll.result or {}).get("risk_score"),
        "tron_signed": (enroll.result or {}).get("tron_signed", False),
        "txid": sig.txid if sig else None,
    }


def get_result(db: Session, company_id: str, enroll_id: str) -> dict:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document not found")
    if not enroll.result:
        raise HTTPException(status_code=404, detail="No result yet — document has not been verified")
    doc = read(db, Document, id=enroll.document_id)
    sig = read(db, Signature, document_enroll_id=enroll.id)
    r = enroll.result
    return {
        "enroll_id": str(enroll.id),
        "document_id": str(doc.id) if doc else None,
        "paths": doc.multipaths if doc else [],
        "status": enroll.status,
        "criteria": r.get("criteria"),
        "extracted_fields": r.get("extracted_fields"),
        "conflicts": r.get("conflicts"),
        "flags": r.get("flags"),
        "suggestions": r.get("suggestions", []),
        "risk_score": r.get("risk_score"),
        "verdict": r.get("verdict"),
        "tron_signed": r.get("tron_signed", False),
        "signature": {
            "id": str(sig.id),
            "hash": sig.hash,
            "txid": sig.txid,
            "to_address": sig.to_address,
            "verify_url": f"https://nile.tronscan.org/#/transaction/{sig.txid}",
        } if sig else None,
    }


def verify_uploaded_documents(
    db: Session,
    company_id: str,
    criteria_id: str,
    files: list[UploadFile],
) -> dict:
    paths = [_save_upload(f, company_id) for f in files]
    from app.api.v1.verify.service import verify_documents
    return verify_documents(db, company_id, criteria_id, paths)
