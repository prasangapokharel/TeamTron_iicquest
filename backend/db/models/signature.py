import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.config.base import Base


class Signature(Base):
    __tablename__ = "signature"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_enroll_id = Column(UUID(as_uuid=True), ForeignKey("document_enroll.id"), nullable=False)
    hash = Column(String, nullable=False)
    txid = Column(String, nullable=False)
    to_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
