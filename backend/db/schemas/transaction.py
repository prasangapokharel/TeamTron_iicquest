from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: UUID
    company_id: UUID
    payment_method_id: int
    amount: int
    txid: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
