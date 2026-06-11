import os
import hmac
import uuid
import base64
import hashlib
import secrets
import httpx
from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all, update
from db.models.payment import Payment
from db.models.plan import Plan
from db.models.balance import Balance
from db.models.transaction import Transaction
from db.models.payment_method import PaymentMethod

ESEWA_SECRET = os.getenv("ESEWA_SECRET_KEY", "8gBm/:&EnhH.1/q")
ESEWA_PRODUCT_CODE = os.getenv("ESEWA_PRODUCT_CODE", "EPAYTEST")
ESEWA_BASE_URL = os.getenv("ESEWA_BASE_URL", "https://rc-epay.esewa.com.np")
ESEWA_VERIFY_URL = os.getenv("ESEWA_VERIFY_URL", "https://uat.esewa.com.np/api/epay/transaction/status/")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


def _sign(message: str) -> str:
    h = hmac.new(ESEWA_SECRET.encode(), message.encode(), hashlib.sha256)
    return base64.b64encode(h.digest()).decode()


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


def initialize_esewa(db: Session, company_id: str, amount: int) -> dict:
    method = read(db, PaymentMethod, name="esewa")
    if not method:
        raise HTTPException(status_code=404, detail="eSewa payment method not found")

    transaction_uuid = str(uuid.uuid4())
    message = f"total_amount={amount},transaction_uuid={transaction_uuid},product_code={ESEWA_PRODUCT_CODE}"
    signature = _sign(message)

    txn = create(
        db, Transaction,
        company_id=company_id,
        payment_method_id=method.id,
        amount=amount,
        txid=transaction_uuid,
        status="pending",
    )

    return {
        "transaction_id": str(txn.id),
        "esewa_url": f"{ESEWA_BASE_URL}/api/epay/main/v2/form",
        "fields": {
            "amount": amount,
            "tax_amount": 0,
            "total_amount": amount,
            "transaction_uuid": transaction_uuid,
            "product_code": ESEWA_PRODUCT_CODE,
            "product_service_charge": 0,
            "product_delivery_charge": 0,
            "success_url": f"{BACKEND_URL}/api/v1/payment/success",
            "failure_url": f"{BACKEND_URL}/api/v1/payment/failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature,
        },
    }


def verify_esewa(db: Session, data: str) -> dict:
    try:
        decoded = base64.b64decode(data).decode()
        import json
        payload = json.loads(decoded)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid eSewa response data")

    transaction_uuid = payload.get("transaction_uuid")
    total_amount = payload.get("total_amount")
    status = payload.get("status")

    if status != "COMPLETE":
        txn = read(db, Transaction, txid=transaction_uuid)
        if txn:
            update(db, txn, status="failed")
        raise HTTPException(status_code=400, detail="Payment not completed")

    try:
        resp = httpx.get(
            ESEWA_VERIFY_URL,
            params={
                "product_code": ESEWA_PRODUCT_CODE,
                "total_amount": total_amount,
                "transaction_uuid": transaction_uuid,
            },
            timeout=10,
        )
        verify_data = resp.json()
    except Exception:
        raise HTTPException(status_code=502, detail="eSewa verification failed")

    if verify_data.get("status") != "COMPLETE":
        raise HTTPException(status_code=400, detail="eSewa verification rejected")

    txn = read(db, Transaction, txid=transaction_uuid)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.status == "success":
        return {"message": "Already processed", "transaction_id": str(txn.id)}

    update(db, txn, status="success")

    balance = read(db, Balance, company_id=txn.company_id)
    if balance:
        update(db, balance, balance=balance.balance + txn.amount)
    else:
        create(db, Balance, company_id=txn.company_id, balance=txn.amount)

    return {
        "message": "Payment successful",
        "transaction_id": str(txn.id),
        "amount": txn.amount,
        "new_balance": (read(db, Balance, company_id=txn.company_id)).balance,
    }
