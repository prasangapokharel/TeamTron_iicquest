import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from db.config.env import SessionLocal
from db.models.payment_method import PaymentMethod


def seed():
    db = SessionLocal()
    try:
        if not db.query(PaymentMethod).filter_by(name="esewa").first():
            db.add(PaymentMethod(name="esewa"))
            db.commit()
            print("Seeded: esewa")
        else:
            print("Already seeded")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
