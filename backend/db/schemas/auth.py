from pydantic import BaseModel
from uuid import UUID


class AuthCreate(BaseModel):
    company_id: UUID
    password: str


class AuthResponse(BaseModel):
    id: UUID
    company_id: UUID
    model_config = {"from_attributes": True}
