import uuid
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from db.config.base import Base


class Document(Base):
    __tablename__ = "document"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    multipaths = Column(JSONB, nullable=False)
