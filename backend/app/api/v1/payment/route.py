import logging
import os
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.config.env import get_db
from db.models.company import Company
from app.helper.deps import get_current_company
from app.api.v1.payment import service

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payment", tags=["payment"])


class PaymentCreateRequest(BaseModel):
    plan_id: str
    amount: int


class EsewaInitRequest(BaseModel):
    amount: int = Field(..., gt=0)


@router.post("", status_code=201)
def create_payment(
    body: PaymentCreateRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.create_payment(db, str(company.id), body.plan_id, body.amount)


@router.get("")
def list_payments(
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.list_payments(db, str(company.id))


@router.post("/initialize")
def initialize_esewa(
    body: EsewaInitRequest,
    db: Session = Depends(get_db),
    company: Company = Depends(get_current_company),
):
    return service.initialize_esewa(db, str(company.id), body.amount)


def _balance_redirect(status: str, **params: str | int) -> RedirectResponse:
    query = urlencode({"payment": status, **params})
    return RedirectResponse(f"{FRONTEND_URL}/settings/balance?{query}")


@router.get("/success")
def esewa_success(data: str = Query(...), db: Session = Depends(get_db)):
    try:
        result = service.verify_esewa(db, data)
        return _balance_redirect(
            "success",
            amount=result.get("amount", ""),
            balance=result.get("new_balance", ""),
        )
    except HTTPException as exc:
        detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        return _balance_redirect("failed", reason=detail)
    except Exception:
        logger.exception("eSewa payment verification failed")
        return _balance_redirect("failed", reason="verification_error")


@router.get("/failure")
def esewa_failure():
    return _balance_redirect("failed", reason="cancelled")
