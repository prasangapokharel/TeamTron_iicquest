import os
import jwt
from datetime import datetime, timedelta, timezone

SECRET = os.getenv("JWT_SECRET", "vivadx-secret-change-in-production")
ALGORITHM = "HS256"
EXPIRE_HOURS = 24


def create_token(company_id: str) -> str:
    return jwt.encode(
        {
            "sub": company_id,
            "exp": datetime.now(timezone.utc) + timedelta(hours=EXPIRE_HOURS),
        },
        SECRET,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
