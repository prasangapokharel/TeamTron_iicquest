import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from db.config.env import SessionLocal
from db.models.plan import Plan


def seed():
    db = SessionLocal()
    try:
        if not db.query(Plan).first():
            db.add(Plan(per_user=50))
            db.commit()
            print("Seeded: plan per_user=50")
        else:
            print("Already seeded")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
