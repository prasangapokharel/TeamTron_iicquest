import uuid
from sqlalchemy import Column, ForeignKey, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class CriteriaEnroll(Base):
    __tablename__ = "criteria_enroll"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    criteria_id = Column(UUID(as_uuid=True), ForeignKey("criteria.id"), nullable=False)
    severity = Column(String, nullable=True)
    message = Column(String, nullable=True)
    is_critical = Column(Boolean, default=False, nullable=False)
