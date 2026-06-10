#!/usr/bin/env python3
"""
VIVAD X — Full End-to-End Verification Test
Real filled KYC document image against live backend.
"""

import json
import sys
import uuid
import requests

BASE = "http://localhost:8000/api/v1"
IMAGE_PATH = "/home/prasanga/TeamTron_iicquest/backend/unit/filledimage.png"


def p(label: str, data):
    print(f"\n{label}")
    print(json.dumps(data, indent=2, default=str))


def die(msg: str, resp: requests.Response):
    print(f"\nERROR: {msg}")
    print(f"Status: {resp.status_code}")
    try:
        print(json.dumps(resp.json(), indent=2))
    except Exception:
        print(resp.text[:500])
    sys.exit(1)


# ─── SETUP ────────────────────────────────────────────────────────────────────
uid8 = str(uuid.uuid4())[:8]
email = f"filled_{uid8}@test.com"
password = "test1234"
company_name = f"TestCo {uid8}"

print("=" * 60)
print("=== STEP 1: REGISTER + LOGIN ===")
print("=" * 60)

r = requests.post(f"{BASE}/auth/register", json={
    "company_name": company_name,
    "email": email,
    "password": password,
})
if r.status_code not in (200, 201):
    die("Register failed", r)
print(f"Registered: {email}")
p("Register response:", r.json())

r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
if r.status_code != 200:
    die("Login failed", r)
login_data = r.json()
p("Login response:", login_data)

token = login_data.get("access_token") or login_data.get("token") or login_data.get("data", {}).get("access_token")
if not token:
    # try deeper
    for v in login_data.values():
        if isinstance(v, dict):
            token = v.get("access_token") or v.get("token")
            if token:
                break
if not token:
    print("Full login response for debug:")
    print(json.dumps(login_data, indent=2))
    die("Could not find token in login response", r)

HEADERS = {"Authorization": f"Bearer {token}"}
print(f"\nToken obtained: {token[:40]}...")

# ─── STEP 2: CREATE BANK KYC CRITERIA ────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 2: CREATE BANK KYC CRITERIA ===")
print("=" * 60)

bank_uid = str(uuid.uuid4())[:8]
bank_criteria_payload = {
    "data": {
        "name": f"Bank KYC {bank_uid}",
        "category": "bank",
        "fields": ["full_name", "citizenship_no", "pan_no", "expiry_date", "annual_income", "address"],
        "rules": [
            {"check": "cross_match", "field": "full_name", "severity": "red", "description": "Name must match across all documents"},
            {"check": "cross_match", "field": "citizenship_no", "severity": "red", "description": "Citizenship number must be consistent"},
            {"check": "not_expired", "field": "expiry_date", "severity": "red", "description": "Document must not be expired"},
            {"check": "min_threshold", "field": "annual_income", "threshold": 50000, "severity": "orange", "description": "Minimum annual income Rs 50,000"},
            {"check": "cross_match", "field": "pan_no", "severity": "orange", "description": "PAN number consistency check"},
        ],
    }
}

r = requests.post(f"{BASE}/criteria", json=bank_criteria_payload, headers=HEADERS)
if r.status_code not in (200, 201):
    die("Create Bank KYC criteria failed", r)
bank_criteria = r.json()
p("Bank KYC criteria created:", bank_criteria)

# extract criteria id
bank_criteria_id = (
    bank_criteria.get("id")
    or bank_criteria.get("criteria_id")
    or (bank_criteria.get("data") or {}).get("id")
    or (bank_criteria.get("data") or {}).get("criteria_id")
)
if not bank_criteria_id:
    for v in bank_criteria.values():
        if isinstance(v, dict):
            bank_criteria_id = v.get("id") or v.get("criteria_id")
            if bank_criteria_id:
                break
print(f"\nBank KYC criteria_id: {bank_criteria_id}")

# ─── STEP 3: UPLOAD + VERIFY (BANK KYC) ──────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 3: UPLOAD filledimage.png — BANK KYC VERIFY ===")
print("=" * 60)

with open(IMAGE_PATH, "rb") as f:
    image_bytes = f.read()

r = requests.post(
    f"{BASE}/document/verify",
    headers=HEADERS,
    data={"criteria_id": bank_criteria_id},
    files=[("files", ("filledimage.png", image_bytes, "image/png"))],
)
if r.status_code not in (200, 201):
    die("Document verify (bank) failed", r)
bank_verify = r.json()
print("\nFULL Bank KYC Verify Response:")
print(json.dumps(bank_verify, indent=2, default=str))

# ─── STEP 4: DETAILED ANALYSIS (BANK KYC) ────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 4: DETAILED ANALYSIS — BANK KYC ===")
print("=" * 60)

def extract_nested(d: dict, *keys):
    """Try to get a value from nested dicts by trying multiple key paths."""
    for key in keys:
        if isinstance(key, (list, tuple)):
            v = d
            for k in key:
                if isinstance(v, dict):
                    v = v.get(k)
                else:
                    v = None
                    break
            if v is not None:
                return v
        else:
            v = d.get(key)
            if v is not None:
                return v
    return None

def print_analysis(verify_data: dict, label: str):
    # Try multiple possible shapes
    result = (
        verify_data.get("result")
        or verify_data.get("data")
        or verify_data
    )

    print(f"\n--- {label} ---")

    # Extracted fields
    extracted = (
        result.get("extracted_fields")
        or result.get("fields")
        or result.get("extraction")
        or {}
    )
    if isinstance(extracted, list):
        extracted = {item.get("field", i): item.get("value") for i, item in enumerate(extracted)}
    print("\nExtracted Fields:")
    if extracted:
        for k, v in extracted.items():
            print(f"  {k}: {v}")
    else:
        print("  (none found in response)")

    # Flags
    flags = (
        result.get("flags")
        or result.get("issues")
        or result.get("violations")
        or []
    )
    print(f"\nFlags ({len(flags)}):")
    if flags:
        for flag in flags:
            print(f"  field={flag.get('field','?')}  severity={flag.get('severity','?')}  issue={flag.get('issue') or flag.get('message') or flag.get('description','?')}")
    else:
        print("  (none)")

    # Risk + verdict
    score = result.get("risk_score") or result.get("score") or verify_data.get("risk_score") or verify_data.get("score")
    verdict = result.get("verdict") or verify_data.get("verdict")
    print(f"\nRisk Score: {score}")
    print(f"Verdict: {verdict}")

    # Tron signing
    tron_signed = result.get("tron_signed") or verify_data.get("tron_signed")
    txid = result.get("txid") or verify_data.get("txid")
    to_address = result.get("to_address") or verify_data.get("to_address")
    verify_url = result.get("verify_url") or verify_data.get("verify_url")
    print(f"\nTron Signed: {tron_signed}")
    print(f"Txid: {txid}")
    print(f"To Address: {to_address}")
    print(f"Verify URL: {verify_url}")

    return {
        "verdict": verdict,
        "score": score,
        "tron_signed": tron_signed,
        "txid": txid,
    }

bank_analysis = print_analysis(bank_verify, "BANK KYC")

# ─── GET ENROLL ID ────────────────────────────────────────────────────────────
bank_enroll_id = (
    bank_verify.get("enroll_id")
    or bank_verify.get("id")
    or bank_verify.get("document_enroll_id")
    or (bank_verify.get("data") or {}).get("enroll_id")
    or (bank_verify.get("data") or {}).get("id")
    or (bank_verify.get("result") or {}).get("enroll_id")
)
print(f"\nBank enroll_id: {bank_enroll_id}")

# ─── STEP 5: GET STORED RESULT ────────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 5: GET /document/{enroll_id}/result ===")
print("=" * 60)

if bank_enroll_id:
    r = requests.get(f"{BASE}/document/{bank_enroll_id}/result", headers=HEADERS)
    if r.status_code == 200:
        stored = r.json()
        print("\nFull Stored Result:")
        print(json.dumps(stored, indent=2, default=str))
    else:
        print(f"Status {r.status_code}: {r.text[:300]}")
else:
    print("No enroll_id found — skipping")

# ─── STEP 6: SIGNATURE ───────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 6: SIGNATURE CHECK ===")
print("=" * 60)

verdict = bank_analysis.get("verdict", "").upper() if bank_analysis.get("verdict") else ""

if bank_enroll_id:
    r = requests.get(f"{BASE}/signature/{bank_enroll_id}", headers=HEADERS)
    print(f"GET /signature/{bank_enroll_id}  →  status={r.status_code}")
    if r.status_code == 200:
        sig_data = r.json()
        print("\nFull Signature:")
        print(json.dumps(sig_data, indent=2, default=str))

        txid = (
            sig_data.get("txid")
            or (sig_data.get("data") or {}).get("txid")
            or (sig_data.get("signature") or {}).get("txid")
        )
        if txid:
            print(f"\nVerifying txid on Tron Nile testnet: {txid}")
            r2 = requests.get(f"{BASE}/signature/verify/{txid}", headers=HEADERS)
            print(f"GET /signature/verify/{txid}  →  status={r2.status_code}")
            if r2.status_code == 200:
                print(json.dumps(r2.json(), indent=2, default=str))
            else:
                print(r2.text[:300])
    else:
        print(r.text[:300])

# ─── STEP 7: RULE ANALYSIS ───────────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 7: RULE ANALYSIS ===")
print("=" * 60)

result_obj = bank_verify.get("result") or bank_verify.get("data") or bank_verify
flags = result_obj.get("flags") or result_obj.get("issues") or result_obj.get("violations") or []
verdict_val = result_obj.get("verdict") or bank_verify.get("verdict") or "UNKNOWN"

print(f"\nVerdict: {verdict_val}")
if verdict_val and verdict_val.upper() in ("RED", "ORANGE"):
    print(f"\nRules that fired ({len(flags)} flags):")
    for flag in flags:
        fld = flag.get('field', '?')
        sev = flag.get('severity', '?')
        iss = flag.get('issue') or flag.get('message') or flag.get('description', '?')
        chk = flag.get('check', '')
        print(f"  [{sev.upper()}] field={fld}  check={chk}  issue={iss}")
elif verdict_val and verdict_val.upper() == "GREEN":
    print("  All rules passed — verdict GREEN")
else:
    print(f"  Verdict: {verdict_val}")
    if flags:
        for flag in flags:
            print(f"  {flag}")

# ─── STEP 8: DASHBOARD ───────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 8: DASHBOARD STATS ===")
print("=" * 60)

# Try common dashboard/stats endpoints
for endpoint in ["/company/dashboard", "/company/stats", "/company/me", "/company"]:
    r = requests.get(f"{BASE}{endpoint}", headers=HEADERS)
    if r.status_code == 200:
        print(f"\nGET {endpoint}  →  200 OK")
        print(json.dumps(r.json(), indent=2, default=str))
        break
    else:
        print(f"GET {endpoint}  →  {r.status_code}")

# ─── STEP 9: AI ASSISTANT ─────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 9: AI ASSISTANT ===")
print("=" * 60)

question = (
    "Tell me everything about my latest document verification — "
    "what fields were found, what issues were detected, what is the risk score, "
    "and is it signed on blockchain?"
)
print(f"\nAsking: {question}\n")

r = requests.post(f"{BASE}/assistant/chat", json={"message": question}, headers=HEADERS)
print(f"Status: {r.status_code}")
if r.status_code == 200:
    assistant_resp = r.json()
    print(json.dumps(assistant_resp, indent=2, default=str))
else:
    print(r.text[:500])

# ─── STEP 10: MANPOWER CRITERIA ──────────────────────────────────────────────
print("\n" + "=" * 60)
print("=== STEP 10: MANPOWER AGENCY CRITERIA ===")
print("=" * 60)

mp_uid = str(uuid.uuid4())[:8]
mp_criteria_payload = {
    "data": {
        "name": f"Manpower Agency {mp_uid}",
        "category": "manpower",
        "fields": [
            "agent_name", "agency_name", "license_no", "salary_amount",
            "destination_country", "expiry_date", "deployment_date", "payment_date",
        ],
        "rules": [
            {"check": "not_expired", "field": "expiry_date", "severity": "red"},
            {"check": "cross_match", "field": "agent_name", "severity": "red"},
            {"check": "min_threshold", "field": "salary_amount", "threshold": 20000, "severity": "orange"},
            {"check": "date_logic", "fields": ["deployment_date", "expiry_date"], "severity": "red"},
        ],
    }
}

r = requests.post(f"{BASE}/criteria", json=mp_criteria_payload, headers=HEADERS)
if r.status_code not in (200, 201):
    die("Create Manpower criteria failed", r)
mp_criteria = r.json()
p("Manpower criteria created:", mp_criteria)

mp_criteria_id = (
    mp_criteria.get("id")
    or mp_criteria.get("criteria_id")
    or (mp_criteria.get("data") or {}).get("id")
    or (mp_criteria.get("data") or {}).get("criteria_id")
)
print(f"\nManpower criteria_id: {mp_criteria_id}")

# Upload same image for manpower
with open(IMAGE_PATH, "rb") as f:
    image_bytes = f.read()

r = requests.post(
    f"{BASE}/document/verify",
    headers=HEADERS,
    data={"criteria_id": mp_criteria_id},
    files=[("files", ("filledimage.png", image_bytes, "image/png"))],
)
if r.status_code not in (200, 201):
    die("Document verify (manpower) failed", r)
mp_verify = r.json()
print("\nFULL Manpower Verify Response:")
print(json.dumps(mp_verify, indent=2, default=str))

mp_analysis = print_analysis(mp_verify, "MANPOWER AGENCY")

mp_enroll_id = (
    mp_verify.get("enroll_id")
    or mp_verify.get("id")
    or mp_verify.get("document_enroll_id")
    or (mp_verify.get("data") or {}).get("enroll_id")
    or (mp_verify.get("data") or {}).get("id")
    or (mp_verify.get("result") or {}).get("enroll_id")
)

# Compare bank vs manpower extracted fields
print("\n--- Comparing Extracted Fields: Bank KYC vs Manpower ---")
bank_result = bank_verify.get("result") or bank_verify.get("data") or bank_verify
mp_result = mp_verify.get("result") or mp_verify.get("data") or mp_verify

bank_fields = bank_result.get("extracted_fields") or bank_result.get("fields") or {}
mp_fields = mp_result.get("extracted_fields") or mp_result.get("fields") or {}

if isinstance(bank_fields, list):
    bank_fields = {item.get("field", i): item.get("value") for i, item in enumerate(bank_fields)}
if isinstance(mp_fields, list):
    mp_fields = {item.get("field", i): item.get("value") for i, item in enumerate(mp_fields)}

print(f"\nBank KYC asked for:  {['full_name','citizenship_no','pan_no','expiry_date','annual_income','address']}")
print(f"Bank extracted:      {list(bank_fields.keys())}")
print(f"\nManpower asked for:  {['agent_name','agency_name','license_no','salary_amount','destination_country','expiry_date','deployment_date','payment_date']}")
print(f"Manpower extracted:  {list(mp_fields.keys())}")

# ─── FINAL RESULTS ────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("FINAL RESULTS:")
bank_verdict = (bank_verify.get("result") or bank_verify.get("data") or bank_verify).get("verdict") or bank_verify.get("verdict") or "?"
bank_score = (bank_verify.get("result") or bank_verify.get("data") or bank_verify).get("risk_score") or bank_verify.get("risk_score") or "?"
bank_tron = (bank_verify.get("result") or bank_verify.get("data") or bank_verify).get("tron_signed") or bank_verify.get("tron_signed") or False
bank_txid = (bank_verify.get("result") or bank_verify.get("data") or bank_verify).get("txid") or bank_verify.get("txid") or "none"

mp_verdict = (mp_verify.get("result") or mp_verify.get("data") or mp_verify).get("verdict") or mp_verify.get("verdict") or "?"
mp_score = (mp_verify.get("result") or mp_verify.get("data") or mp_verify).get("risk_score") or mp_verify.get("risk_score") or "?"
mp_tron = (mp_verify.get("result") or mp_verify.get("data") or mp_verify).get("tron_signed") or mp_verify.get("tron_signed") or False
mp_txid = (mp_verify.get("result") or mp_verify.get("data") or mp_verify).get("txid") or mp_verify.get("txid") or "none"

print(f"  Bank KYC:   verdict={bank_verdict}  score={bank_score}  tron={'yes' if bank_tron else 'no'}  txid={bank_txid}")
print(f"  Manpower:   verdict={mp_verdict}  score={mp_score}  tron={'yes' if mp_tron else 'no'}  txid={mp_txid}")
print("=" * 60)
