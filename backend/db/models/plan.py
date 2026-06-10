import uuid
from sqlalchemy import Column, Integer
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class Plan(Base):
    __tablename__ = "plan"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    per_user = Column(Integer, default=100, nullable=False)
