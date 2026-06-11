from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


class SignatureProofSchema(BaseModel):
    id: UUID
    signature_id: UUID | None
    document_enroll_id: UUID
    file_hash: str
    file_size: int
    width: int | None
    height: int | None
    mime_type: str | None
    original_filename: str | None
    phash: str | None
    meta: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
