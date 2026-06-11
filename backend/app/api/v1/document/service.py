import os
import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile

from app.helper.crude import create, read, read_all
from db.models.document import Document
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _save_upload(file: UploadFile, company_id: str) -> str:
    ext = os.path.splitext(file.filename or "doc.jpg")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=422, detail=f"Unsupported file type: {ext}. Use jpg, png, or webp.")
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail=f"Invalid content type: {content_type}. Must be an image.")
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


def list_documents(db: Session, company_id: str, limit: int = 20, offset: int = 0) -> list:
    import uuid as _uuid
    from sqlalchemy import desc
    try:
        cid = _uuid.UUID(company_id)
    except ValueError:
        cid = company_id
    enrollments = (
        db.query(DocumentEnroll)
        .filter_by(company_id=cid)
        .order_by(desc(DocumentEnroll.id))
        .offset(offset)
        .limit(limit)
        .all()
    )
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
                "criteria_category": result_data.get("criteria", {}).get("category"),
                "suggestion_count": len(result_data.get("suggestions", [])),
            })
    return result


def get_document_file_path(db: Session, company_id: str, enroll_id: str, file_index: int) -> tuple[str, str]:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = read(db, Document, id=enroll.document_id)
    if not doc or not doc.multipaths:
        raise HTTPException(status_code=404, detail="No files for this document")
    if file_index < 0 or file_index >= len(doc.multipaths):
        raise HTTPException(status_code=404, detail="File not found")
    path = doc.multipaths[file_index]
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    ext = os.path.splitext(path)[1].lower()
    media = "image/jpeg" if ext in {".jpg", ".jpeg"} else "image/png"
    return path, media


def get_document(db: Session, company_id: str, enroll_id: str) -> dict:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = read(db, Document, id=enroll.document_id)
    sig = read(db, Signature, document_enroll_id=enroll.id)
    r = enroll.result or {}
    criteria = r.get("criteria") or {}
    return {
        "enroll_id": str(enroll.id),
        "document_id": str(doc.id) if doc else None,
        "paths": doc.multipaths if doc else [],
        "status": enroll.status,
        "verdict": r.get("verdict"),
        "risk_score": r.get("risk_score"),
        "criteria_name": criteria.get("name"),
        "criteria_category": criteria.get("category"),
        "tron_signed": r.get("tron_signed", False),
        "txid": sig.txid if sig else None,
    }


def _sanitize_stored_result(result: dict) -> dict:
    from app.core.prompts.base import synthetic_enabled

    if synthetic_enabled():
        return result
    out = dict(result)
    out["is_synthetic"] = False
    out["synthetic_count"] = 0
    out["flags"] = [
        f for f in out.get("flags") or []
        if not (f.get("field") == "image" and f.get("value") == "synthetic")
    ]
    out["suggestions"] = [
        s for s in out.get("suggestions") or []
        if "synthetic" not in s.lower()
    ]
    docs = []
    for doc in out.get("documents") or []:
        d = dict(doc)
        if d.get("is_synthetic"):
            d = {**d, "is_synthetic": False}
            d["flags"] = [f for f in d.get("flags") or [] if f.get("field") != "image"]
            d["suggestions"] = [
                s for s in d.get("suggestions") or []
                if "synthetic" not in s.lower()
            ]
        docs.append(d)
    if docs:
        out["documents"] = docs
    return out


def get_result(db: Session, company_id: str, enroll_id: str) -> dict:
    enroll = read(db, DocumentEnroll, id=enroll_id, company_id=company_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document not found")
    if not enroll.result:
        raise HTTPException(status_code=404, detail="No result yet — document has not been verified")
    doc = read(db, Document, id=enroll.document_id)
    sig = read(db, Signature, document_enroll_id=enroll.id)
    stored = dict(enroll.result)
    result = {
        **stored,
        "enroll_id": str(enroll.id),
        "document_enroll_id": str(enroll.id),
        "document_id": str(doc.id) if doc else stored.get("document_id"),
        "paths": doc.multipaths if doc else stored.get("paths", []),
        "status": enroll.status,
    }
    if sig:
        sig_block = {
            "id": str(sig.id),
            "hash": sig.hash,
            "txid": sig.txid,
            "to_address": sig.to_address,
            "verify_url": f"https://nile.tronscan.org/#/transaction/{sig.txid}",
        }
        result["signature"] = sig_block
        result.setdefault("hash", sig.hash)
        result.setdefault("txid", sig.txid)
        result.setdefault("to_address", sig.to_address)
        result.setdefault("verify_url", sig_block["verify_url"])
    return _sanitize_stored_result(result)


def verify_uploaded_documents(
    db: Session,
    company_id: str,
    criteria_id: str,
    files: list[UploadFile],
) -> dict:
    paths = [_save_upload(f, company_id) for f in files]
    from app.api.v1.verify.service import verify_documents
    return verify_documents(db, company_id, criteria_id, paths)
