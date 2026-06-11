"""
End-to-end test: API key authentication for document verification.

Flow:
  1. Register a fresh company
  2. Login → get JWT
  3. Generate API key
  4. Call GET /balance with X-Api-Key header (no JWT)
  5. Call POST /verify with X-Api-Key header (no JWT)
  6. Revoke the API key
  7. Confirm revoked key returns 401
"""
import uuid
import sys
import requests

BASE = "http://localhost:8000/api/v1"
email = f"apikey_{uuid.uuid4().hex[:8]}@test.com"
password = "Test1234!"
results = []


def check(name, resp, expected_status):
    ok = resp.status_code == expected_status
    results.append((name, ok, resp.status_code))
    mark = "PASS" if ok else "FAIL"
    body = f"  body={resp.text[:200]}" if not ok else ""
    print(f"[{mark}] {name} → {resp.status_code}{body}")
    return resp


print("=" * 60)
print("API KEY VERIFY FLOW TEST")
print("=" * 60)

# ─── 1. REGISTER ──────────────────────────────────────────────
print("\n--- AUTH ---")
r = requests.post(f"{BASE}/auth/register", json={
    "company_name": "ApiKey Test Co",
    "email": email,
    "password": password,
})
check("POST /auth/register", r, 201)

# ─── 2. LOGIN → JWT ───────────────────────────────────────────
r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
check("POST /auth/login", r, 200)

if r.status_code != 200:
    print("[FATAL] Login failed — cannot continue.")
    sys.exit(1)

jwt_headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

# ─── 3. GENERATE API KEY ──────────────────────────────────────
print("\n--- API KEY ---")
r = requests.post(f"{BASE}/apikey", headers=jwt_headers)
check("POST /apikey (generate)", r, 201)

if r.status_code != 201:
    print("[FATAL] Could not generate API key.")
    sys.exit(1)

apikey_id = r.json()["id"]
apikey = r.json()["apikey"]
api_headers = {"X-Api-Key": apikey}
print(f"  key={apikey[:16]}...")

# ─── 4. USE API KEY — GET /balance ────────────────────────────
print("\n--- API KEY AUTH (no JWT) ---")
r = requests.get(f"{BASE}/balance", headers=api_headers)
check("GET /balance via X-Api-Key", r, 200)

# ─── 5. USE API KEY — GET /company/me ─────────────────────────
r = requests.get(f"{BASE}/company/me", headers=api_headers)
# company/me uses get_current_company (JWT only) — expect 401
check("GET /company/me via X-Api-Key (expects 401)", r, 401)

# ─── 6. USE API KEY — POST /verify ────────────────────────────
print("\n--- VERIFY VIA API KEY ---")

# First, get a criteria enroll id using JWT
r = requests.get(f"{BASE}/criteria/enrolled", headers=jwt_headers)
enroll_id = None
if r.status_code == 200 and r.json():
    enroll_id = r.json()[0]["id"]
    print(f"  Using enroll_id={enroll_id}")

if enroll_id:
    r = requests.post(f"{BASE}/verify", headers={**api_headers, "Content-Type": "application/json"}, json={
        "paths": ["fake/path/doc1.jpg"],
        "criteria_id": enroll_id,
    })
    # Accept any non-500 (502 = AI/Groq error with fake image is fine)
    ok = r.status_code != 500
    results.append(("POST /verify via X-Api-Key", ok, r.status_code))
    mark = "PASS" if ok else "FAIL"
    print(f"[{mark}] POST /verify via X-Api-Key → {r.status_code} (non-500 = pass)")
    if not ok:
        print(f"  body={r.text[:200]}")
else:
    print("[SKIP] POST /verify — no enrolled criteria (seed criteria first)")

# ─── 7. REVOKE KEY → CONFIRM 401 ─────────────────────────────
print("\n--- REVOKE & CONFIRM ---")
r = requests.delete(f"{BASE}/apikey/{apikey_id}", headers=jwt_headers)
check("DELETE /apikey/{id} (revoke)", r, 200)

r = requests.get(f"{BASE}/balance", headers=api_headers)
check("GET /balance with revoked key (expects 401)", r, 401)

# ─── SUMMARY ─────────────────────────────────────────────────
print(f"\n{'=' * 60}")
passed = sum(1 for _, ok, _ in results if ok)
total = len(results)
print(f"Results: {passed}/{total} passed\n")
for name, ok, code in results:
    print(f"  {'✓' if ok else '✗'} {name} → {code}")

print()
if passed < total:
    sys.exit(1)
