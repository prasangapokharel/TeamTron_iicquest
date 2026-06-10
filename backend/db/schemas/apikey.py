from pydantic import BaseModel
from uuid import UUID
from db.models.apikey import ApiKeyStatus


class ApiKeyCreate(BaseModel):
    company_id: UUID
    apikey: str
    status: ApiKeyStatus = ApiKeyStatus.active


class ApiKeyResponse(ApiKeyCreate):
    id: UUID
    model_config = {"from_attributes": True}
