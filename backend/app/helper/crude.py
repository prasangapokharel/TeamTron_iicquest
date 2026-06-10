import uuid
from sqlalchemy.orm import Session
from typing import TypeVar, Type

T = TypeVar("T")


def _coerce(v):
    if isinstance(v, str):
        try:
            return uuid.UUID(v)
        except ValueError:
            return v
    return v


def _filters(kwargs: dict) -> dict:
    return {k: _coerce(v) for k, v in kwargs.items()}


def create(db: Session, model: Type[T], **data) -> T:
    obj = model(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def read(db: Session, model: Type[T], **filters) -> T | None:
    return db.query(model).filter_by(**_filters(filters)).first()


def read_all(db: Session, model: Type[T], **filters) -> list[T]:
    return db.query(model).filter_by(**_filters(filters)).all()


def update(db: Session, obj: T, **data) -> T:
    for key, value in data.items():
        setattr(obj, key, value)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, obj: T) -> None:
    db.delete(obj)
    db.commit()
