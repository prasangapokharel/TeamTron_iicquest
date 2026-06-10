from pydantic import BaseModel
from uuid import UUID


class CategoryEnrollCreate(BaseModel):
    company_id: UUID
    category_id: UUID


class CategoryEnrollResponse(CategoryEnrollCreate):
    id: UUID
    model_config = {"from_attributes": True}
