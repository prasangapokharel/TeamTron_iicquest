"""
Seed: University Documents Criteria
Run: python db/seed/unicritaria.py

Covers degree certificates, transcripts, character certificates, and enrollment letters.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv

load_dotenv()

from db.config.env import SessionLocal
from db.models.criteria import Criteria

DATA = {
    "name": "University Documents",
    "category": "university",
    "fields": [
        "student_name",
        "student_id",
        "father_name",
        "university_name",
        "faculty",
        "program",
        "degree_level",
        "certificate_no",
        "roll_no",
        "issue_date",
        "graduation_date",
        "gpa",
        "document_type",
    ],
    "rules": [
        {
            "id": "student_name_mismatch",
            "field": "student_name",
            "check": "cross_match",
            "description": "Student name mismatch across documents",
            "severity": "red",
        },
        {
            "id": "student_id_mismatch",
            "field": "student_id",
            "check": "cross_match",
            "description": "Student ID / registration number mismatch",
            "severity": "red",
        },
        {
            "id": "university_mismatch",
            "field": "university_name",
            "check": "cross_match",
            "description": "University name mismatch across documents",
            "severity": "red",
        },
        {
            "id": "certificate_no_mismatch",
            "field": "certificate_no",
            "check": "cross_match",
            "description": "Certificate or transcript number mismatch",
            "severity": "red",
        },
        {
            "id": "roll_no_mismatch",
            "field": "roll_no",
            "check": "cross_match",
            "description": "Roll number mismatch across documents",
            "severity": "red",
        },
        {
            "id": "program_mismatch",
            "field": "program",
            "check": "cross_match",
            "description": "Program / major mismatch across documents",
            "severity": "orange",
        },
        {
            "id": "father_name_variation",
            "field": "father_name",
            "check": "cross_match",
            "description": "Father name variation across documents",
            "severity": "orange",
        },
        {
            "id": "low_gpa",
            "field": "gpa",
            "check": "min_threshold",
            "threshold": 2.0,
            "description": "GPA below minimum requirement (2.0)",
            "severity": "orange",
        },
        {
            "id": "impossible_dates",
            "fields": ["issue_date", "graduation_date"],
            "check": "date_logic",
            "description": "Issue date is after graduation date — impossible",
            "severity": "red",
        },
    ],
    "verdict_thresholds": {
        "green": 80,
        "orange": 50,
    },
}


def run():
    db = SessionLocal()
    try:
        existing = db.query(Criteria).filter(
            Criteria.data["name"].astext == DATA["name"]
        ).first()
        if existing:
            print(f"[SKIP] University Documents criteria already exists: {existing.id}")
            return existing.id
        criteria = Criteria(data=DATA)
        db.add(criteria)
        db.commit()
        db.refresh(criteria)
        print(f"[OK] University Documents criteria seeded: {criteria.id}")
        return criteria.id
    finally:
        db.close()


if __name__ == "__main__":
    run()
