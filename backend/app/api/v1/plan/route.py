from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.config.env import get_db
from app.api.v1.plan import service

router = APIRouter(prefix="/plan", tags=["plan"])


@router.get("")
def get_plans(db: Session = Depends(get_db)):
    return service.get_plans(db)
