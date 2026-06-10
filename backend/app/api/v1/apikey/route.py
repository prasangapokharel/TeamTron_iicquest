from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.apikey import service

router = APIRouter(prefix="/apikey", tags=["api-key"])


@router.post("", status_code=201)
def generate(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.generate_apikey(db, str(company.id))


@router.get("")
def list_keys(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.list_apikeys(db, str(company.id))


@router.delete("/{apikey_id}")
def revoke(
    apikey_id: str,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.revoke_apikey(db, apikey_id, str(company.id))
