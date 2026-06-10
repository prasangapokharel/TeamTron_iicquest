import uuid
import enum
from sqlalchemy import Column, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    failed = "failed"
    verified = "verified"


class DocumentEnroll(Base):
    __tablename__ = "document_enroll"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document.id"), nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.pending, nullable=False)
