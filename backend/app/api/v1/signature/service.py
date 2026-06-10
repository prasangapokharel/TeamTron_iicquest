from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, update
from app.service.tron.tron import hash_fields, sign_on_tron, get_transaction
from db.models.document_enroll import DocumentEnroll, DocumentStatus
from db.models.signature import Signature


def sign_document(db: Session, document_enroll_id: str, fields: dict) -> dict:
    enroll = read(db, DocumentEnroll, id=document_enroll_id)
    if not enroll:
        raise HTTPException(status_code=404, detail="Document enrollment not found")
    if enroll.status == DocumentStatus.verified:
        raise HTTPException(status_code=409, detail="Document already signed")

    hash_value = hash_fields(fields)
    txid = sign_on_tron(hash_value)

    sig = create(db, Signature, document_enroll_id=enroll.id, hash=hash_value, txid=txid)
    update(db, enroll, status=DocumentStatus.verified)

    return {
        "signature_id": str(sig.id),
        "document_enroll_id": document_enroll_id,
        "hash": hash_value,
        "txid": txid,
        "verify_url": f"https://nile.tronscan.org/#/transaction/{txid}",
    }


def get_signature(db: Session, document_enroll_id: str) -> dict:
    sig = read(db, Signature, document_enroll_id=document_enroll_id)
    if not sig:
        raise HTTPException(status_code=404, detail="Signature not found")
    return {
        "signature_id": str(sig.id),
        "document_enroll_id": document_enroll_id,
        "hash": sig.hash,
        "txid": sig.txid,
        "verify_url": f"https://nile.tronscan.org/#/transaction/{sig.txid}",
    }


def verify_txid(txid: str) -> dict:
    return get_transaction(txid)
