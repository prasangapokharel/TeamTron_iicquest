"""
Seed: Manpower Agency Criteria
Run: python db/seed/manpower_agency.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from db.config.env import SessionLocal
from db.models.criteria import Criteria

DATA = {
    "name": "Manpower Agency",
    "category": "manpower",
    "fields": [
        "Name",
        "Father Name",
        "Agency Name",
        "License No.",
        "Amount/Salary",
        "Destination",
        "Expiry Date",
        "Payment Date",
        "Deployment Date"
    ],
    "rules": [
        {
            "id": "name_mismatch",
            "field": "Name",
            "check": "cross_match",
            "description": "Worker name mismatch across documents",
            "severity": "red"
        },
        {
            "id": "salary_mismatch",
            "field": "Amount/Salary",
            "check": "cross_match",
            "description": "Salary / promised amount mismatch across documents",
            "severity": "red"
        },
        {
            "id": "destination_mismatch",
            "field": "Destination",
            "check": "cross_match",
            "description": "Destination country mismatch across documents",
            "severity": "red"
        },
        {
            "id": "license_mismatch",
            "field": "License No.",
            "check": "cross_match",
            "description": "Agency license number mismatch or invalid",
            "severity": "red"
        },
        {
            "id": "license_expired",
            "field": "Expiry Date",
            "check": "not_expired",
            "description": "License or contract is expired",
            "severity": "red"
        },
        {
            "id": "impossible_dates",
            "fields": ["Payment Date", "Deployment Date"],
            "check": "date_logic",
            "description": "Payment date is after deployment date — impossible",
            "severity": "red"
        },
        {
            "id": "agency_name_variation",
            "field": "Agency Name",
            "check": "cross_match",
            "description": "Agency name variation across documents",
            "severity": "red"
        },
        {
            "id": "father_name_mismatch",
            "field": "Father Name",
            "check": "cross_match",
            "description": "Father name mismatch across documents",
            "severity": "orange"
        }
    ],
    "verdict_thresholds": {
        "green": 80,
        "orange": 50
    }
}


def run():
    db = SessionLocal()
    try:
        existing = db.query(Criteria).filter(
            Criteria.data["name"].astext == DATA["name"]
        ).first()
        if existing:
            print(f"[SKIP] Manpower Agency criteria already exists: {existing.id}")
            return
        criteria = Criteria(data=DATA)
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        print(f"[OK] Manpower Agency criteria seeded: {criteria.id}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
