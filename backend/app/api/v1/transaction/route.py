from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.transaction import service

router = APIRouter(prefix="/transaction", tags=["transaction"])


@router.get("")
def list_transactions(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.list_transactions(db, str(company.id))
