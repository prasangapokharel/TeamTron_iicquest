from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class CriteriaEnrollCreate(BaseModel):
    company_id: UUID
    criteria_id: UUID
    severity: Optional[str] = None
    message: Optional[str] = None
    is_critical: bool = False


class CriteriaEnrollResponse(CriteriaEnrollCreate):
    id: UUID
    model_config = {"from_attributes": True}
