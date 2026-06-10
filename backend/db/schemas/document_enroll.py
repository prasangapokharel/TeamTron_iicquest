from pydantic import BaseModel
from uuid import UUID
from db.models.document_enroll import DocumentStatus


class DocumentEnrollCreate(BaseModel):
    company_id: UUID
    document_id: UUID
    status: DocumentStatus = DocumentStatus.pending


class DocumentEnrollResponse(DocumentEnrollCreate):
    id: UUID
    model_config = {"from_attributes": True}
