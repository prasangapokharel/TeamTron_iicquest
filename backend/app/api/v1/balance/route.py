from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from db.schemas.balance import BalanceTopUp
from app.helper.deps import get_current_company
from app.api.v1.balance import service

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get("")
def get_balance(db: Session = Depends(get_db), company: Company = Depends(get_current_company)):
    return service.get_balance(db, company)


@router.post("/topup")
def topup(
    body: BalanceTopUp,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.topup_balance(db, company, body.amount)
