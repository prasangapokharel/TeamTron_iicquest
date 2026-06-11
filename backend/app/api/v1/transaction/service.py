from sqlalchemy.orm import Session
from db.models.transaction import Transaction
from app.helper.crude import read_all


def list_transactions(db: Session, company_id: str) -> list:
    txns = read_all(db, Transaction, company_id=company_id)
    return [
        {
            "id": str(t.id),
            "payment_method_id": t.payment_method_id,
            "amount": t.amount,
            "txid": t.txid,
            "status": t.status,
            "created_at": str(t.created_at),
        }
        for t in txns
    ]
