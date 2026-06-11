import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.config.base import Base


class Transaction(Base):
    __tablename__ = "transaction"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_method.id"), nullable=False)
    amount = Column(Integer, nullable=False)
    txid = Column(String, unique=True, nullable=False)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
