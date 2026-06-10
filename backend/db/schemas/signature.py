from pydantic import BaseModel
from uuid import UUID


class SignatureCreate(BaseModel):
    document_enroll_id: UUID
    hash: str
    txid: str


class SignatureResponse(SignatureCreate):
    id: UUID
    model_config = {"from_attributes": True}
