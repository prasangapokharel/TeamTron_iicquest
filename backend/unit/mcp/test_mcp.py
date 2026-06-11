"""Live end-to-end test for all 6 MCP tools."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import uuid
import importlib
import requests

BASE = "http://localhost:8000/api/v1"
IMAGE1 = os.path.join(os.path.dirname(__file__), "..", "image.png")
IMAGE2 = os.path.join(os.path.dirname(__file__), "..", "filledimage.png")
CRITERIA_ID = "9917bdf8-fd9b-4aca-8f17-17a94c3cf1c9"


def setup():
    email = f"mcp_{uuid.uuid4().hex[:6]}@test.com"
    requests.post(f"{BASE}/auth/register", json={"company_name": "MCP Test Co", "email": email, "password": "Test1234!"})
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": "Test1234!"})
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    r = requests.post(f"{BASE}/apikey", headers=headers)
    api_key = r.json()["apikey"]

    requests.post(f"{BASE}/balance/topup", headers=headers, json={"amount": 1000})
    requests.post(f"{BASE}/criteria/enroll", headers=headers, json={"criteria_id": CRITERIA_ID})

    return api_key


def upload_and_get_paths(api_key: str) -> list[str]:
    """Upload via /verify/upload, then retrieve saved paths from /document."""
    with open(IMAGE1, "rb") as f1, open(IMAGE2, "rb") as f2:
        requests.post(
            f"{BASE}/verify/upload",
            headers={"X-Api-Key": api_key},
            data={"criteria_id": CRITERIA_ID},
            files=[("files", ("image.png", f1, "image/png")), ("files", ("filledimage.png", f2, "image/png"))],
        )
    r = requests.get(f"{BASE}/document", headers={"X-Api-Key": api_key}, params={"limit": 1})
    docs = r.json()
    if not docs:
        raise RuntimeError("No documents found after upload")
    return docs[0]["paths"]


def run():
    print("Setting up company, API key, balance, and criteria enroll...")
    api_key = setup()
    print(f"API_KEY: {api_key}\n")

    os.environ["VIVAD_API_KEY"] = api_key
    os.environ["VIVAD_BASE_URL"] = "http://localhost:8000"

    import app.mcp.server as srv
    importlib.reload(srv)

    results = {}

    def check(name: str, result: str, *, allow_502: bool = False):
        failed = result.startswith("Error:")
        if failed and allow_502 and "502" in result:
            print(f"[SKIP] {name}: AI service unavailable (502)\n")
            results[name] = "SKIP"
        elif failed:
            print(f"[FAIL] {name}: {result[:160]}\n")
            results[name] = "FAIL"
        else:
            print(f"[PASS] {name}\n{result[:400]}\n")
            results[name] = "PASS"

    check("get_balance", srv.get_balance())
    check("get_dashboard", srv.get_dashboard())
    check("list_criteria", srv.list_criteria())
    check("get_verification_history", srv.get_verification_history(5))
    check("ask_assistant", srv.ask_assistant("What is VIVAD X?"), allow_502=True)

    print("Uploading images for verify_document...")
    try:
        paths = upload_and_get_paths(api_key)
        image_paths = ",".join(paths)
        print(f"Uploaded paths: {image_paths}\n")
        check("verify_document", srv.verify_document(image_paths, CRITERIA_ID))
    except RuntimeError as e:
        print(f"[FAIL] verify_document: {e}\n")
        results["verify_document"] = "FAIL"

    print("=" * 40)
    for tool, status in results.items():
        print(f"{status:4}  {tool}")

    failed = [k for k, v in results.items() if v == "FAIL"]
    if failed:
        print(f"\nFailed: {failed}")
        sys.exit(1)
    else:
        print("\nAll tools passed (or skipped due to AI service).")


if __name__ == "__main__":
    run()
