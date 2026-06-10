import uuid
from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class Payment(Base):
    __tablename__ = "payment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plan.id"), nullable=False)
    transaction_id = Column(String(8), unique=True, nullable=False)
    amount = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)
