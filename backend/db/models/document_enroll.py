import uuid
import enum
from sqlalchemy import Column, Enum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from db.config.base import Base


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    review = "review"
    failed = "failed"
    verified = "verified"


class DocumentEnroll(Base):
    __tablename__ = "document_enroll"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.pending, nullable=False)
    result = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
