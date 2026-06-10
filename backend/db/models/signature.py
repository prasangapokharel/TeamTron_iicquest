import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class Signature(Base):
    __tablename__ = "signature"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_enroll_id = Column(UUID(as_uuid=True), ForeignKey("document_enroll.id"), nullable=False)
    hash = Column(String, nullable=False)
    txid = Column(String, nullable=False)
