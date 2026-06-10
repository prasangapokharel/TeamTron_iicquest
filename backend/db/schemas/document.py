from pydantic import BaseModel
from uuid import UUID


class DocumentCreate(BaseModel):
    multipaths: list[str]


class DocumentResponse(DocumentCreate):
    id: UUID
    model_config = {"from_attributes": True}
