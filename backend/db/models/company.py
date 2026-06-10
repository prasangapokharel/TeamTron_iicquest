import uuid
import enum
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from db.config.base import Base


class CompanyStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class Company(Base):
    __tablename__ = "company"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    logo = Column(String, nullable=True)
    status = Column(Enum(CompanyStatus), default=CompanyStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
