import secrets
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all
from db.models.payment import Payment
from db.models.plan import Plan


def _unique_transaction_id(db: Session) -> str:
    for _ in range(10):
        txn_id = secrets.token_hex(4)
        if not read(db, Payment, transaction_id=txn_id):
            return txn_id
    raise HTTPException(status_code=500, detail="Failed to generate unique transaction ID")


def create_payment(db: Session, company_id: str, plan_id: str, amount: int) -> dict:
    if not read(db, Plan, id=plan_id):
        raise HTTPException(status_code=404, detail="Plan not found")
    txn_id = _unique_transaction_id(db)
    payment = create(
        db, Payment,
        company_id=company_id,
        plan_id=plan_id,
        transaction_id=txn_id,
        amount=amount,
        date=date.today(),
    )
    return {
        "id": str(payment.id),
        "transaction_id": payment.transaction_id,
        "amount": payment.amount,
        "date": str(payment.date),
        "plan_id": plan_id,
    }


def list_payments(db: Session, company_id: str) -> list:
    payments = read_all(db, Payment, company_id=company_id)
    return [
        {
            "id": str(p.id),
            "transaction_id": p.transaction_id,
            "amount": p.amount,
            "date": str(p.date),
            "plan_id": str(p.plan_id),
        }
        for p in payments
    ]
