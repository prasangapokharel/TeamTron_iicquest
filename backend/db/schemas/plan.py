from pydantic import BaseModel
from uuid import UUID


class PlanCreate(BaseModel):
    per_user: int = 100


class PlanResponse(PlanCreate):
    id: UUID
    model_config = {"from_attributes": True}
