import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from dotenv import load_dotenv
load_dotenv()

from db.config.env import SessionLocal
from db.models.company import Company
from db.models.balance import Balance


def run():
    db = SessionLocal()
    try:
        companies = db.query(Company).all()
        for company in companies:
            exists = db.query(Balance).filter_by(company_id=company.id).first()
            if not exists:
                db.add(Balance(company_id=company.id, balance=100))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
