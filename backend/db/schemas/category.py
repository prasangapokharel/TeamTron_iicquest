from pydantic import BaseModel
from uuid import UUID


class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(CategoryCreate):
    id: UUID
    model_config = {"from_attributes": True}
