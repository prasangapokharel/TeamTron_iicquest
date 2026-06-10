import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class Category(Base):
    __tablename__ = "category"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
