import uuid
from sqlalchemy.orm import Session
from typing import TypeVar, Type

T = TypeVar("T")


_UUID_KEYS = frozenset({
    "id",
    "company_id",
    "criteria_id",
    "category_id",
    "document_id",
    "document_enroll_id",
    "plan_id",
})


def _coerce_uuid(v):
    if isinstance(v, uuid.UUID):
        return v
    if isinstance(v, str):
        try:
            return uuid.UUID(v)
        except ValueError:
            return v
    return v


def _filters(kwargs: dict) -> dict:
    out = {}
    for key, value in kwargs.items():
        if key in _UUID_KEYS:
            out[key] = _coerce_uuid(value)
        else:
            out[key] = value
    return out


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
