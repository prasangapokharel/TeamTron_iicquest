import secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all, update
from db.models.apikey import ApiKey, ApiKeyStatus


def generate_apikey(db: Session, company_id: str) -> dict:
    key = secrets.token_urlsafe(32)
    apikey = create(db, ApiKey, company_id=company_id, apikey=key, status=ApiKeyStatus.active)
    return {
        "id": str(apikey.id),
        "apikey": apikey.apikey,
        "status": apikey.status,
    }


def list_apikeys(db: Session, company_id: str) -> list:
    keys = read_all(db, ApiKey, company_id=company_id)
    return [{"id": str(k.id), "apikey": k.apikey, "status": k.status} for k in keys]


def revoke_apikey(db: Session, apikey_id: str, company_id: str) -> dict:
    key = read(db, ApiKey, id=apikey_id, company_id=company_id)
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    update(db, key, status=ApiKeyStatus.revoke)
    return {"message": "API key revoked", "id": apikey_id}
