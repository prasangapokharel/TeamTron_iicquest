import uuid
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.config.base import Base


class Criteria(Base):
    __tablename__ = "criteria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data = Column(JSONB, nullable=False, unique=True)
