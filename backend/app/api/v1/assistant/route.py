from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_company_from_jwt_or_apikey
from app.api.v1.assistant import service

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_company_from_jwt_or_apikey),
):
    return service.chat(db, str(company.id), body.message)
