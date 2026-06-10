from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import read, create, update
from db.models.balance import Balance
from db.models.company import Company


def get_balance(db: Session, company: Company) -> dict:
    row = read(db, Balance, company_id=company.id)
    if not row:
        row = create(db, Balance, company_id=company.id, balance=0)
    return {"company_id": str(company.id), "balance": row.balance}


def topup_balance(db: Session, company: Company, amount: int) -> dict:
    row = read(db, Balance, company_id=company.id)
    if not row:
        row = create(db, Balance, company_id=company.id, balance=amount)
    else:
        update(db, row, balance=row.balance + amount)
    return {"company_id": str(company.id), "balance": row.balance}
