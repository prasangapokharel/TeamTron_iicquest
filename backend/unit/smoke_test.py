import uuid
import sys
import time
import requests

BASE = "http://localhost:8000/api/v1"
email = f"smoke_{uuid.uuid4().hex[:8]}@test.com"
password = "test1234"
token = None
headers = {}
results = []

# State
category_id = None
criteria_id = None
enroll_id = None
doc_enroll_id = None
apikey_id = None
plan_id = None


def check(name, resp, expected_status):
    ok = resp.status_code == expected_status
    results.append((name, ok, resp.status_code))
    status = "PASS" if ok else "FAIL"
    body_preview = resp.text[:200] if not ok else ""
    print(f"[{status}] {name} → {resp.status_code}" + (f" (expected {expected_status}) body={body_preview}" if not ok else ""))
    return resp


def section(title):
    print(f"\n--- {title} ---")


# ─── AUTH ─────────────────────────────────────────────────────────────────────

section("AUTH")

r = requests.post(f"{BASE}/auth/register", json={
    "company_name": "Smoke Test Co",
    "email": email,
    "password": password,
})
check("POST /auth/register (new)", r, 201)

r = requests.post(f"{BASE}/auth/register", json={
    "company_name": "Smoke Test Co",
    "email": email,
    "password": password,
})
check("POST /auth/register (duplicate)", r, 409)

r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
check("POST /auth/login (correct)", r, 200)
if r.status_code == 200:
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": "wrongpassword"})
check("POST /auth/login (wrong password)", r, 401)

if not token:
    print("\n[FATAL] No auth token — cannot continue.")
    sys.exit(1)

# ─── COMPANY ──────────────────────────────────────────────────────────────────

section("COMPANY")

r = requests.get(f"{BASE}/company/me", headers=headers)
check("GET /company/me", r, 200)

r = requests.patch(f"{BASE}/company/me", headers=headers, json={"company_name": "Smoke Updated Co"})
check("PATCH /company/me", r, 200)

r = requests.get(f"{BASE}/company/dashboard", headers=headers)
check("GET /company/dashboard", r, 200)

# ─── API KEY ──────────────────────────────────────────────────────────────────

section("API KEY")

r = requests.post(f"{BASE}/apikey", headers=headers)
check("POST /apikey", r, 201)
if r.status_code == 201:
    data = r.json()
    apikey_id = data.get("id")
    generated_apikey = data.get("apikey")

r = requests.get(f"{BASE}/apikey", headers=headers)
check("GET /apikey", r, 200)

if apikey_id:
    r = requests.delete(f"{BASE}/apikey/{apikey_id}", headers=headers)
    check("DELETE /apikey/{id}", r, 200)

# ─── CATEGORY ─────────────────────────────────────────────────────────────────

section("CATEGORY")

r = requests.post(f"{BASE}/category", headers=headers, json={"name": "Smoke Category"})
check("POST /category", r, 201)
if r.status_code == 201:
    category_id = r.json().get("id")

r = requests.get(f"{BASE}/category", headers=headers)
check("GET /category", r, 200)

if category_id:
    r = requests.post(f"{BASE}/category/enroll", headers=headers, json={"category_id": category_id})
    check("POST /category/enroll", r, 201)

r = requests.get(f"{BASE}/category/enrolled", headers=headers)
check("GET /category/enrolled", r, 200)

# ─── CRITERIA ─────────────────────────────────────────────────────────────────

section("CRITERIA")

criteria_payload = {
    "data": {
        "name": "Smoke Criteria",
        "category": "test",
        "fields": ["name", "date"],
        "rules": [
            {"field": "name", "severity": "red", "description": "Name must match"},
            {"field": "date", "severity": "orange", "description": "Date must be valid"},
        ],
    }
}

r = requests.post(f"{BASE}/criteria", headers=headers, json=criteria_payload)
check("POST /criteria", r, 201)
if r.status_code == 201:
    criteria_id = r.json().get("id")

r = requests.get(f"{BASE}/criteria", headers=headers)
check("GET /criteria", r, 200)

if criteria_id:
    r = requests.post(f"{BASE}/criteria/enroll", headers=headers, json={"criteria_id": criteria_id})
    check("POST /criteria/enroll", r, 201)

r = requests.get(f"{BASE}/criteria/enrolled", headers=headers)
check("GET /criteria/enrolled", r, 200)

# ─── DOCUMENT ─────────────────────────────────────────────────────────────────

section("DOCUMENT")

r = requests.post(f"{BASE}/document", headers=headers, json={
    "paths": ["fake/path/doc1.jpg", "fake/path/doc2.jpg"]
})
check("POST /document", r, 201)
if r.status_code == 201:
    doc_enroll_id = r.json().get("enroll_id")

r = requests.get(f"{BASE}/document", headers=headers)
check("GET /document", r, 200)

if doc_enroll_id:
    r = requests.get(f"{BASE}/document/{doc_enroll_id}", headers=headers)
    check("GET /document/{enroll_id}", r, 200)

# ─── PLAN ─────────────────────────────────────────────────────────────────────

section("PLAN")

r = requests.get(f"{BASE}/plan", headers=headers)
check("GET /plan", r, 200)
if r.status_code == 200 and r.json():
    plan_id = r.json()[0].get("id")

# ─── PAYMENT ──────────────────────────────────────────────────────────────────

section("PAYMENT")

if plan_id:
    r = requests.post(f"{BASE}/payment", headers=headers, json={"plan_id": plan_id, "amount": 100})
    check("POST /payment", r, 201)
else:
    print("[SKIP] POST /payment — no plan available in DB")

r = requests.get(f"{BASE}/payment", headers=headers)
check("GET /payment", r, 200)

# ─── SIGNATURE ────────────────────────────────────────────────────────────────

section("SIGNATURE")

r = requests.get(f"{BASE}/signature", headers=headers)
check("GET /signature", r, 200)

fake_txid = "fakefakefakefakefakefakefakefakefakefakefakefakefakefakefakefake"
r = requests.get(f"{BASE}/signature/verify/{fake_txid}")
ok = r.status_code in (404, 502, 200)
results.append(("GET /signature/verify/{txid} (fake)", ok, r.status_code))
status = "PASS" if ok else "FAIL"
print(f"[{status}] GET /signature/verify/{{txid}} (fake) → {r.status_code}" + ("" if ok else f" body={r.text[:200]}"))

# ─── ASSISTANT ────────────────────────────────────────────────────────────────

section("ASSISTANT")

r = requests.post(f"{BASE}/assistant/chat", headers=headers, json={"message": "How many documents do I have?"})
ok = r.status_code == 200 and bool(r.json().get("answer"))
results.append(("POST /assistant/chat", ok, r.status_code))
status = "PASS" if ok else "FAIL"
if not ok:
    print(f"[{status}] POST /assistant/chat → {r.status_code} body={r.text[:200]}")
else:
    answer_preview = r.json().get("answer", "")[:100]
    print(f"[{status}] POST /assistant/chat → {r.status_code} answer={answer_preview!r}")

# ─── VERIFY ───────────────────────────────────────────────────────────────────

section("VERIFY")

if criteria_id:
    r = requests.post(f"{BASE}/verify", headers=headers, json={
        "paths": ["fake/path/doc1.jpg", "fake/path/doc2.jpg"],
        "criteria_id": criteria_id,
    })
    # Acceptable: any non-500 response (Groq/Tron will likely fail with 502)
    ok = r.status_code != 500
    results.append(("POST /verify (Groq/Tron may fail)", ok, r.status_code))
    status = "PASS" if ok else "FAIL"
    print(f"[{status}] POST /verify → {r.status_code}" + ("" if ok else f" body={r.text[:200]}"))
    if not ok:
        print(f"  body={r.text[:300]}")
    else:
        print(f"  (expected: non-500) body_preview={r.text[:120]}")
else:
    print("[SKIP] POST /verify — no criteria_id available")

# ─── SUMMARY ──────────────────────────────────────────────────────────────────

print(f"\n{'='*60}")
passed = sum(1 for _, ok, _ in results if ok)
total = len(results)
print(f"Results: {passed}/{total} passed")
print()
for name, ok, code in results:
    mark = "✓" if ok else "✗"
    print(f"  {mark} {name} → {code}")

print()
if passed < total:
    sys.exit(1)
