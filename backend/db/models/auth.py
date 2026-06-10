import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class Auth(Base):
    __tablename__ = "auth"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    password = Column(String, nullable=False)
