import uuid
import enum
from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class ApiKeyStatus(str, enum.Enum):
    active = "active"
    revoke = "revoke"


class ApiKey(Base):
    __tablename__ = "apikey"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    apikey = Column(String, unique=True, nullable=False)
    status = Column(Enum(ApiKeyStatus), default=ApiKeyStatus.active, nullable=False)
