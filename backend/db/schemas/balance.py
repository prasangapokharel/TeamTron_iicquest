from pydantic import BaseModel, Field
from uuid import UUID


class BalanceResponse(BaseModel):
    company_id: UUID
    balance: int

    model_config = {"from_attributes": True}


class BalanceTopUp(BaseModel):
    amount: int = Field(..., gt=0)
