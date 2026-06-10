from pydantic import BaseModel
from uuid import UUID
from typing import Any


class CriteriaCreate(BaseModel):
    data: dict[str, Any]


class CriteriaResponse(CriteriaCreate):
    id: UUID
    model_config = {"from_attributes": True}
