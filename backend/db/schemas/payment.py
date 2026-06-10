from pydantic import BaseModel, field_validator
from uuid import UUID
from datetime import date


class PaymentCreate(BaseModel):
    company_id: UUID
    plan_id: UUID
    transaction_id: str
    amount: int
    date: date

    @field_validator("transaction_id")
    @classmethod
    def validate_transaction_id(cls, v: str) -> str:
        if len(v) != 8:
            raise ValueError("transaction_id must be exactly 8 characters")
        return v


class PaymentResponse(PaymentCreate):
    id: UUID
    model_config = {"from_attributes": True}
