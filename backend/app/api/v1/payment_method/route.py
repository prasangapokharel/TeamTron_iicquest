from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.config.env import get_db
from app.api.v1.payment_method import service

router = APIRouter(prefix="/payment_method", tags=["payment_method"])


@router.get("")
def list_payment_methods(db: Session = Depends(get_db)):
    return service.list_payment_methods(db)
