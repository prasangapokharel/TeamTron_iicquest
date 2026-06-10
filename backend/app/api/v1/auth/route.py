from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from db.config.env import get_db
from app.api.v1.auth import service

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    logo: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return service.register(db, body.company_name, body.email, body.password, body.logo)


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    return service.login(db, body.email, body.password)
