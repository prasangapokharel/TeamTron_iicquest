import uuid
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.config.base import Base


class CategoryEnroll(Base):
    __tablename__ = "category_enroll"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("company.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("category.id"), nullable=False)
