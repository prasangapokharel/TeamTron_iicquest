import hashlib
import os
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read
from app.helper import jwt as jwt_helper
from db.models.company import Company
from db.models.auth import Auth


def _hash_password(password: str) -> str:
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return salt.hex() + ":" + key.hex()


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, key_hex = stored.split(":")
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
        return key.hex() == key_hex
    except Exception:
        return False


def register(db: Session, company_name: str, email: str, password: str, logo: str | None) -> dict:
    if read(db, Company, email=email):
        raise HTTPException(status_code=409, detail="Email already registered")
    company = create(db, Company, company_name=company_name, email=email, logo=logo)
    create(db, Auth, company_id=company.id, password=_hash_password(password))
    return {
        "company_id": str(company.id),
        "company_name": company.company_name,
        "email": company.email,
    }


def login(db: Session, email: str, password: str) -> dict:
    company = read(db, Company, email=email)
    if not company:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    auth = read(db, Auth, company_id=company.id)
    if not auth or not _verify_password(password, auth.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "access_token": jwt_helper.create_token(str(company.id)),
        "token_type": "bearer",
        "company_id": str(company.id),
    }
