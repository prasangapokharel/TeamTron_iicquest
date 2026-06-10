from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.helper.crude import create, read, read_all
from db.models.category import Category
from db.models.category_enroll import CategoryEnroll


def list_categories(db: Session) -> list:
    return [{"id": str(c.id), "name": c.name} for c in read_all(db, Category)]


def create_category(db: Session, name: str) -> dict:
    category = create(db, Category, name=name)
    return {"id": str(category.id), "name": category.name}


def enroll_category(db: Session, company_id: str, category_id: str) -> dict:
    if not read(db, Category, id=category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    if read(db, CategoryEnroll, company_id=company_id, category_id=category_id):
        raise HTTPException(status_code=409, detail="Already enrolled")
    enroll = create(db, CategoryEnroll, company_id=company_id, category_id=category_id)
    return {"id": str(enroll.id), "company_id": company_id, "category_id": category_id}


def get_enrolled_categories(db: Session, company_id: str) -> list:
    enrollments = read_all(db, CategoryEnroll, company_id=company_id)
    result = []
    for e in enrollments:
        cat = read(db, Category, id=e.category_id)
        if cat:
            result.append({"enroll_id": str(e.id), "category_id": str(cat.id), "name": cat.name})
    return result
