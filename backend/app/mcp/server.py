import os
import json
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("VIVAD X")

BASE_URL = os.getenv("VIVAD_BASE_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("VIVAD_API_KEY", "")

_headers = {"X-Api-Key": API_KEY}


def _get(path: str, params: dict | None = None) -> str:
    try:
        r = httpx.get(f"{BASE_URL}{path}", headers=_headers, params=params, timeout=30)
        if r.status_code == 401:
            return "Error: Invalid or revoked API key"
        if r.status_code == 402:
            return "Error: Insufficient balance — top up credits to continue"
        if not r.is_success:
            return f"Error: {r.status_code} — {r.text[:200]}"
        return json.dumps(r.json(), indent=2)
    except Exception as e:
        return f"Error: {e}"


def _post(path: str, body: dict) -> str:
    try:
        r = httpx.post(f"{BASE_URL}{path}", headers={**_headers, "Content-Type": "application/json"}, json=body, timeout=60)
        if r.status_code == 401:
            return "Error: Invalid or revoked API key"
        if r.status_code == 402:
            return "Error: Insufficient balance — top up credits to continue"
        if not r.is_success:
            return f"Error: {r.status_code} — {r.text[:200]}"
        return json.dumps(r.json(), indent=2)
    except Exception as e:
        return f"Error: {e}"


@mcp.tool()
def get_dashboard() -> str:
    """Get company dashboard stats: total verified, failed, pending, balance, cost spent."""
    return _get("/api/v1/company/dashboard")


@mcp.tool()
def get_balance() -> str:
    """Check the company's current credit balance."""
    return _get("/api/v1/balance")


@mcp.tool()
def list_criteria() -> str:
    """List all criteria enrolled for the company, with fields and verification rules."""
    return _get("/api/v1/criteria/enrolled")


@mcp.tool()
def get_verification_history(limit: int = 10) -> str:
    """Get recent document verification history with verdict, risk score, and blockchain txid."""
    return _get("/api/v1/document", params={"limit": limit})


@mcp.tool()
def ask_assistant(question: str) -> str:
    """Ask the VIVAD AI assistant about your documents, verifications, balance, or platform features."""
    if not question or not question.strip():
        return "Error: Question cannot be empty"
    return _post("/api/v1/assistant/chat", {"message": question})


@mcp.tool()
def verify_document(image_paths: str, criteria_enroll_id: str) -> str:
    """Verify documents against a criteria. image_paths: comma-separated paths already uploaded. Returns verdict (Green/Orange/Red), risk score, suggestions, and blockchain signature if verified."""
    paths = [p.strip() for p in image_paths.split(",") if p.strip()]
    if not paths:
        return "Error: No image paths provided"
    return _post("/api/v1/verify", {"paths": paths, "criteria_id": criteria_enroll_id})
