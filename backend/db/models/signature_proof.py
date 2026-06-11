import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class SignatureProof(Base):
    __tablename__ = "signature_proof"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    signature_id = Column(UUID(as_uuid=True), ForeignKey("signature.id"), nullable=True)
    document_enroll_id = Column(UUID(as_uuid=True), ForeignKey("document_enroll.id"), nullable=False)
    file_hash = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    original_filename = Column(String, nullable=True)
    phash = Column(String, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
