from typing import Optional
import jwt
from fastapi import Depends, HTTPException, Security, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from db.models.apikey import ApiKey, ApiKeyStatus
from app.helper import jwt as jwt_helper
from app.helper.crude import read

bearer = HTTPBearer(auto_error=False)


def get_current_company(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer),
    db: Session = Depends(get_db),
) -> Company:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization required")
    try:
        payload = jwt_helper.decode_token(credentials.credentials)
        company = read(db, Company, id=payload["sub"])
        if not company:
            raise HTTPException(status_code=401, detail="Company not found")
        return company
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_company_from_jwt_or_apikey(
    x_api_key: Optional[str] = Header(default=None),
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer),
    db: Session = Depends(get_db),
) -> Company:
    if x_api_key:
        key = read(db, ApiKey, apikey=x_api_key, status=ApiKeyStatus.active)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid or revoked API key")
        company = read(db, Company, id=key.company_id)
        if not company:
            raise HTTPException(status_code=401, detail="Company not found")
        return company

    if credentials:
        try:
            payload = jwt_helper.decode_token(credentials.credentials)
            company = read(db, Company, id=payload["sub"])
            if not company:
                raise HTTPException(status_code=401, detail="Company not found")
            return company
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    raise HTTPException(status_code=401, detail="Authorization required")
