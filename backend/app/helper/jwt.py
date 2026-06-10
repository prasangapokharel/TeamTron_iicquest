import os
import jwt
from datetime import datetime, timedelta, timezone

ALGORITHM = "HS256"
EXPIRE_HOURS = 24


def _secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET not set")
    return secret


def create_token(company_id: str) -> str:
    return jwt.encode(
        {
            "sub": company_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRE_HOURS),
        },
        _secret(),
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, _secret(), algorithms=[ALGORITHM])
