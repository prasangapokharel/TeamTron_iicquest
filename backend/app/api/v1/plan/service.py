from sqlalchemy.orm import Session

from app.helper.crude import read_all
from db.models.plan import Plan


def get_plans(db: Session) -> list:
    plans = read_all(db, Plan)
    return [{"id": str(p.id), "per_user": p.per_user} for p in plans]
