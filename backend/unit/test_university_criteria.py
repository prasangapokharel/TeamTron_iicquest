"""
University criteria validation tests.

Run: cd backend && .venv/bin/python -m unit.test_university_criteria
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.seed.unicritaria import DATA
from app.utils.severity import build_flags, compute_risk_score, get_verdict, RED, GREEN
from app.service.groq.groq import merge_extractions


class TestUniversityCriteriaData(unittest.TestCase):
    def test_required_keys(self):
        self.assertEqual(DATA["category"], "university")
        self.assertIn("student_name", DATA["fields"])
        self.assertIn("certificate_no", DATA["fields"])
        self.assertIn("document_type", DATA["fields"])

    def test_rules_reference_valid_fields(self):
        fields = set(DATA["fields"])
        for rule in DATA["rules"]:
            if "field" in rule:
                self.assertIn(rule["field"], fields, rule["id"])
            if "fields" in rule:
                for f in rule["fields"]:
                    self.assertIn(f, fields, rule["id"])


class TestUniversityVerificationFlow(unittest.TestCase):
    FIELDS = DATA["fields"]
    RULES = DATA["rules"]

    def test_matching_certificate_and_transcript_passes(self):
        extracted = {
            "student_name": "RAM BAHADUR THAPA",
            "student_id": "TU-2020-001",
            "university_name": "Tribhuvan University",
            "program": "BSc CSIT",
            "certificate_no": "CERT-8891",
            "roll_no": "20-CS-041",
            "issue_date": "2024-03-15",
            "graduation_date": "2024-01-20",
            "gpa": "3.45",
            "document_type": "degree_certificate",
        }
        results = [
            {"path": "cert.png", "extracted": extracted},
            {"path": "transcript.png", "extracted": {**extracted, "document_type": "transcript"}},
        ]
        merged = merge_extractions(results, self.FIELDS, synthetic_check=False)
        flags = build_flags(merged["fields"], merged["conflicts"], self.RULES)
        score = compute_risk_score(flags)
        verdict = get_verdict(score)
        self.assertNotIn("student_name", merged["conflicts"])
        self.assertGreaterEqual(score, 80)
        self.assertEqual(verdict, GREEN)

    def test_name_conflict_fails(self):
        results = [
            {"path": "a.png", "extracted": {"student_name": "RAM THAPA", "student_id": "TU-1"}},
            {"path": "b.png", "extracted": {"student_name": "SHYAM THAPA", "student_id": "TU-1"}},
        ]
        merged = merge_extractions(results, self.FIELDS, synthetic_check=False)
        flags = build_flags(merged["fields"], merged["conflicts"], self.RULES)
        verdict = get_verdict(compute_risk_score(flags))
        self.assertIn("student_name", merged["conflicts"])
        self.assertLess(compute_risk_score(flags), 80)
        self.assertIn(verdict, (RED, "orange"))

    def test_impossible_dates_flagged(self):
        fields = {
            "student_name": "SITA DEVI",
            "issue_date": "2025-06-01",
            "graduation_date": "2024-01-01",
        }
        flags = build_flags(fields, {}, self.RULES)
        issues = [f.get("issue", "") for f in flags]
        self.assertTrue(any("impossible" in i.lower() for i in issues))


def main():
    print("=" * 60)
    print("UNIVERSITY CRITERIA TESTS")
    print("=" * 60)
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    passed = result.testsRun - len(result.failures) - len(result.errors)
    print(f"\n{passed}/{result.testsRun} passed")
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
