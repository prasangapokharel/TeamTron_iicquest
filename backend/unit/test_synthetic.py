"""
Synthetic image detection tests.

Run: cd backend && .venv/bin/python -m unit.test_synthetic
"""
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.v1.verify.service import _build_suggestions, _build_per_document_summaries
from app.service.groq.groq import merge_extractions, _extract_single, _is_truthy
from app.utils.severity import build_flags, compute_risk_score, get_verdict, RED


FIELDS = ["full_name", "citizenship_no", "pan_no", "expiry_date", "annual_income", "address"]
CRITERIA = {"name": "Nepal Bank KYC", "category": "bank", "fields": FIELDS, "rules": []}
IMAGE = os.path.join(os.path.dirname(__file__), "valid.png")


class TestIsTruthy(unittest.TestCase):
    def test_true_values(self):
        self.assertTrue(_is_truthy(True))
        self.assertTrue(_is_truthy("true"))

    def test_false_values(self):
        self.assertFalse(_is_truthy(False))
        self.assertFalse(_is_truthy(None))


class TestMergeExtractions(unittest.TestCase):
    def test_synthetic_true_when_enabled(self):
        results = [{
            "path": "a.png",
            "extracted": {"is_synthetic": True, **{f: None for f in FIELDS}},
        }]
        merged = merge_extractions(results, FIELDS, synthetic_check=True)
        self.assertTrue(merged["is_synthetic"])
        self.assertEqual(merged["synthetic_count"], 1)
        self.assertEqual(merged["fields"], {})

    @patch.dict(os.environ, {"SYNTHETIC": "False"})
    def test_ignores_synthetic_when_disabled(self):
        results = [{
            "path": "a.png",
            "extracted": {
                "is_synthetic": True,
                "full_name": "RAM BAHADUR",
            },
        }]
        merged = merge_extractions(results, FIELDS, synthetic_check=False)
        self.assertFalse(merged["is_synthetic"])
        self.assertEqual(merged["fields"]["full_name"], "RAM BAHADUR")

    def test_merges_only_real_documents(self):
        results = [
            {"path": "fake.png", "extracted": {"is_synthetic": True, **{f: None for f in FIELDS}}},
            {"path": "real.png", "extracted": {"is_synthetic": False, "full_name": "RAM BAHADUR"}},
        ]
        merged = merge_extractions(results, FIELDS, synthetic_check=True)
        self.assertTrue(merged["is_synthetic"])
        self.assertEqual(merged["synthetic_count"], 1)
        self.assertEqual(merged["fields"]["full_name"], "RAM BAHADUR")


class TestSuggestions(unittest.TestCase):
    def test_all_synthetic_message(self):
        suggestions = _build_suggestions(
            {}, {}, [], FIELDS, "red",
            synthetic_active=True, is_synthetic=True, synthetic_count=2, total_documents=2,
        )
        self.assertEqual(suggestions, ["This document is synthetic."])

    def test_mixed_synthetic_message(self):
        suggestions = _build_suggestions(
            {}, {}, [], FIELDS, "red",
            synthetic_active=True, is_synthetic=True, synthetic_count=2, total_documents=5,
        )
        self.assertIn("2 of 5", suggestions[0])

    @patch.dict(os.environ, {"SYNTHETIC": "False"})
    def test_no_synthetic_message_when_disabled(self):
        suggestions = _build_suggestions(
            {}, {}, [], FIELDS, "red",
            synthetic_active=False, is_synthetic=True,
        )
        self.assertFalse(any("synthetic" in s.lower() for s in suggestions))


class TestPerDocumentSummaries(unittest.TestCase):
    def test_mixed_batch(self):
        raw = [
            {"path": "a.png", "extracted": {"is_synthetic": True, **{f: None for f in FIELDS}}},
            {"path": "b.png", "extracted": {"is_synthetic": False, "full_name": "RAM", "citizenship_no": "1"}},
        ]
        docs = _build_per_document_summaries(raw, FIELDS, [], synthetic_active=True)
        self.assertEqual(len(docs), 2)
        self.assertTrue(docs[0]["is_synthetic"])
        self.assertEqual(docs[0]["suggestions"], ["This document is synthetic."])
        self.assertFalse(docs[1]["is_synthetic"])
        self.assertEqual(docs[1]["extracted_fields"]["full_name"], "RAM")


class TestExtractSingle(unittest.TestCase):
    @patch.dict(os.environ, {"SYNTHETIC": "True"})
    @patch("app.service.groq.groq._check_synthetic", return_value=True)
    def test_skips_extraction_when_synthetic(self, _mock_check):
        result = _extract_single(IMAGE, CRITERIA)
        self.assertTrue(result["is_synthetic"])

    @patch.dict(os.environ, {"SYNTHETIC": "False"})
    @patch("app.service.groq.groq._call_with_fallback")
    def test_strips_synthetic_field_when_disabled(self, mock_call):
        mock_call.return_value.choices = [
            type("C", (), {"message": type("M", (), {
                "content": '{"is_synthetic": true, "full_name": "TEST"}',
            })()})()
        ]
        result = _extract_single(IMAGE, CRITERIA)
        self.assertNotIn("is_synthetic", result)
        self.assertEqual(result["full_name"], "TEST")


def main():
    print("=" * 60)
    print("SYNTHETIC DETECTION TESTS")
    print("=" * 60)
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromModule(sys.modules[__name__])
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    passed = result.testsRun - len(result.failures) - len(result.errors)
    print(f"\n{passed}/{result.testsRun} passed")
    sys.exit(0 if result.wasSuccessful() else 1)


if __name__ == "__main__":
    main()
