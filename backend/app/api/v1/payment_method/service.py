from sqlalchemy.orm import Session
from db.models.payment_method import PaymentMethod
from app.helper.crude import read_all


def list_payment_methods(db: Session) -> list:
    methods = read_all(db, PaymentMethod)
    return [{"id": m.id, "name": m.name} for m in methods]
