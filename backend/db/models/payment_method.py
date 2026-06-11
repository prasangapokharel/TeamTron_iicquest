from sqlalchemy import Column, String, Integer
from db.config.base import Base


class PaymentMethod(Base):
    __tablename__ = "payment_method"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
