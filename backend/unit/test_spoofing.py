#!/usr/bin/env python3
import json
import sys
import uuid
import requests

BASE = "http://localhost:8000/api/v1"
VALID_PNG = "/home/prasanga/TeamTron_iicquest/backend/unit/valid.png"
IMAGE_PNG = "/home/prasanga/TeamTron_iicquest/backend/unit/image.png"


def p(label, data):
    print(f"\n{label}")
    print(json.dumps(data, indent=2, default=str))


def die(msg, resp):
    print(f"\nERROR: {msg} (status={resp.status_code})")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text[:500])
    sys.exit(1)


# ── REGISTER + LOGIN ──────────────────────────────────────────────────────────
uid = str(uuid.uuid4())[:8]
email = f"spooftest_{uid}@test.com"
password = "test1234"

r = requests.post(f"{BASE}/auth/register", json={
    "company_name": f"SpoofCo {uid}",
    "email": email,
    "password": password,
})
if r.status_code not in (200, 201):
    die("Register failed", r)
print(f"Registered: {email}")

r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
if r.status_code != 200:
    die("Login failed", r)

login_data = r.json()
token = (
    login_data.get("access_token")
    or login_data.get("token")
    or (login_data.get("data") or {}).get("access_token")
)
if not token:
    for v in login_data.values():
        if isinstance(v, dict):
            token = v.get("access_token") or v.get("token")
            if token:
                break
if not token:
    die("No token in login response", r)

HEADERS = {"Authorization": f"Bearer {token}"}
print(f"Token: {token[:40]}...")

# ── TOP UP BALANCE ─────────────────────────────────────────────────────────────
r = requests.post(f"{BASE}/balance/topup", headers=HEADERS, json={"amount": 1000})
if r.status_code not in (200, 201):
    die("Topup failed", r)
print(f"Balance: {r.json().get('balance')}")

# ── CREATE CRITERIA ────────────────────────────────────────────────────────────
r = requests.post(f"{BASE}/criteria", headers=HEADERS, json={
    "data": {
        "name": f"Spoof Test {uid}",
        "category": "kyc",
        "fields": ["full_name"],
        "rules": [],
    }
})
if r.status_code not in (200, 201):
    die("Create criteria failed", r)
criteria_id = r.json().get("id") or r.json().get("criteria_id") or (r.json().get("data") or {}).get("id")
print(f"Criteria ID: {criteria_id}")

# ── VERIFY valid.png (creates SignatureProof record) ──────────────────────────
print("\n=== Verifying valid.png (creates proof record) ===")
with open(VALID_PNG, "rb") as f:
    valid_bytes = f.read()

r = requests.post(
    f"{BASE}/document/verify",
    headers=HEADERS,
    data={"criteria_id": criteria_id},
    files=[("files", ("valid.png", valid_bytes, "image/png"))],
)
if r.status_code not in (200, 201):
    die("Verify failed", r)
verify_data = r.json()
print(f"Verdict: {verify_data.get('verdict')} | tron_signed: {verify_data.get('tron_signed')}")

# ── LOAD image.png ─────────────────────────────────────────────────────────────
with open(IMAGE_PNG, "rb") as f:
    image_bytes = f.read()

# ── TEST 1: valid.png + valid.png → IDENTICAL, no spoofing ────────────────────
print("\n=== TEST 1: valid.png + valid.png → expect IDENTICAL ===")
r = requests.post(
    f"{BASE}/document/spoofing/verify",
    headers=HEADERS,
    files=[
        ("file_a", ("valid.png", valid_bytes, "image/png")),
        ("file_b", ("valid.png", valid_bytes, "image/png")),
    ],
)
if r.status_code != 200:
    die("Spoofing test 1 failed", r)
p("Result:", r.json())
assert r.json()["comparison"]["verdict"] == "IDENTICAL"
assert r.json()["spoofing_detected"] == False
print("✅ PASS")

# ── TEST 2: valid.png + image.png → DIFFERENT, spoofing if valid.png verified ─
print("\n=== TEST 2: valid.png + image.png → expect DIFFERENT / spoofing ===")
r = requests.post(
    f"{BASE}/document/spoofing/verify",
    headers=HEADERS,
    files=[
        ("file_a", ("valid.png", valid_bytes, "image/png")),
        ("file_b", ("image.png", image_bytes, "image/png")),
    ],
)
if r.status_code != 200:
    die("Spoofing test 2 failed", r)
result2 = r.json()
p("Result:", result2)
assert result2["comparison"]["verdict"] != "IDENTICAL"
if result2["image_a"]["is_verified"]:
    assert result2["spoofing_detected"] == True
    print("✅ PASS — spoofing detected (valid.png was verified)")
else:
    print("ℹ️  valid.png not verified (non-GREEN verdict) — no proof record yet")

# ── TEST 3: image.png + image.png → IDENTICAL, no verification record ─────────
print("\n=== TEST 3: image.png + image.png → expect IDENTICAL, no record ===")
r = requests.post(
    f"{BASE}/document/spoofing/verify",
    headers=HEADERS,
    files=[
        ("file_a", ("image.png", image_bytes, "image/png")),
        ("file_b", ("image.png", image_bytes, "image/png")),
    ],
)
if r.status_code != 200:
    die("Spoofing test 3 failed", r)
result3 = r.json()
p("Result:", result3)
assert result3["comparison"]["verdict"] == "IDENTICAL"
assert result3["spoofing_detected"] == False
print("✅ PASS")

print("\n=== All tests passed ===")
