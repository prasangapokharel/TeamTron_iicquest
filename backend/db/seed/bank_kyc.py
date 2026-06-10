"""
Seed: Bank KYC Criteria
Run: python db/seed/bank_kyc.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from db.config.env import SessionLocal
from db.models.criteria import Criteria

DATA = {
    "name": "Bank KYC",
    "category": "bank",
    "fields": [
        "Name",
        "Father Name",
        "Citizenship No.",
        "PAN No.",
        "Expiry Date",
        "Address",
        "Amount",
        "Document Type"
    ],
    "rules": [
        {
            "id": "name_mismatch",
            "field": "Name",
            "check": "cross_match",
            "description": "Name mismatch between documents",
            "severity": "red"
        },
        {
            "id": "citizenship_mismatch",
            "field": "Citizenship No.",
            "check": "cross_match",
            "description": "Citizenship number mismatch across documents",
            "severity": "red"
        },
        {
            "id": "pan_mismatch",
            "field": "PAN No.",
            "check": "cross_match",
            "description": "PAN number mismatch or missing",
            "severity": "red"
        },
        {
            "id": "expired_document",
            "field": "Expiry Date",
            "check": "not_expired",
            "description": "Document is expired",
            "severity": "red"
        },
        {
            "id": "father_name_variation",
            "field": "Father Name",
            "check": "cross_match",
            "description": "Father name variation across documents",
            "severity": "orange"
        },
        {
            "id": "address_mismatch",
            "field": "Address",
            "check": "cross_match",
            "description": "Address mismatch across documents",
            "severity": "orange"
        },
        {
            "id": "low_income",
            "field": "Amount",
            "check": "min_threshold",
            "threshold": 10000,
            "description": "Declared income too low for loan",
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
            print(f"[SKIP] Bank KYC criteria already exists: {existing.id}")
            return
        criteria = Criteria(data=DATA)
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        print(f"[OK] Bank KYC criteria seeded: {criteria.id}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
