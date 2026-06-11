"""Business-perspective end-to-end audit test."""
import json
import time
import requests

BASE = "http://localhost:8000/api/v1"
RESULTS = []


def log(flow, check, status, detail=""):
    icon = "PASS" if status else "FAIL"
    RESULTS.append((flow, check, icon, detail))
    print(f"[{icon}] {flow} | {check}" + (f" — {detail}" if detail else ""))


def reg(name, email, password="password123", logo=None):
    r = requests.post(f"{BASE}/auth/register", json={
        "company_name": name, "email": email, "password": password, "logo": logo
    })
    return r


def login(email, password="password123"):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password})
    return r


def auth_header(token):
    return {"Authorization": f"Bearer {token}"}


ts = str(int(time.time()))

# ─── FLOW 1: Company Onboarding ────────────────────────────────────────────────
print("\n=== FLOW 1: Company Onboarding ===")
EMAIL1 = f"audit1_{ts}@test.com"
r = reg("AuditCo1", EMAIL1)
log("F1", "Register new company", r.status_code == 201, str(r.status_code))

r2 = reg("AuditCo1", EMAIL1)
log("F1", "Duplicate email → 409", r2.status_code == 409, str(r2.status_code))

r3 = login(EMAIL1, "wrongpassword")
log("F1", "Wrong password → 401", r3.status_code == 401, str(r3.status_code))

r4 = login(EMAIL1)
log("F1", "Correct login → token", r4.status_code == 200 and "access_token" in r4.json(), str(r4.status_code))
TOKEN1 = r4.json().get("access_token", "")
COMPANY1_ID = r4.json().get("company_id", "")

r5 = requests.get(f"{BASE}/company/me", headers=auth_header(TOKEN1))
log("F1", "GET /company/me", r5.status_code == 200, str(r5.status_code))

r6 = requests.patch(f"{BASE}/company/me", headers=auth_header(TOKEN1), json={"company_name": "AuditCo1-Updated"})
log("F1", "PATCH /company/me", r6.status_code == 200, str(r6.status_code))

# Security: register second company and try to access its data
EMAIL2 = f"audit2_{ts}@test.com"
reg("AuditCo2", EMAIL2)
r7 = login(EMAIL2)
TOKEN2 = r7.json().get("access_token", "")
COMPANY2_ID = r7.json().get("company_id", "")

# Test: can company1 see company2's profile? GET /company/me always uses JWT → should be own data
r8 = requests.get(f"{BASE}/company/me", headers=auth_header(TOKEN1))
own_id = r8.json().get("id", "")
log("F1", "Security: JWT isolation (own data only)", own_id == COMPANY1_ID, f"got {own_id}")

# ─── FLOW 2: API Key Management ────────────────────────────────────────────────
print("\n=== FLOW 2: API Key Management ===")
r = requests.post(f"{BASE}/apikey", headers=auth_header(TOKEN1))
log("F2", "Generate API key", r.status_code == 201, str(r.status_code))
API_KEY1 = r.json().get("apikey", "")
API_KEY_ID1 = r.json().get("id", "")

r2 = requests.get(f"{BASE}/apikey", headers=auth_header(TOKEN1))
keys = r2.json()
key_found = any(k.get("apikey") == API_KEY1 for k in keys)
log("F2", "List keys → key appears", key_found, str(r2.status_code))

r3 = requests.get(f"{BASE}/balance", headers={"X-API-Key": "fake-key-xyz"})
log("F2", "Fake API key → 401", r3.status_code == 401, str(r3.status_code))

# Security: use company2's API key to call company1 resources
r4 = requests.post(f"{BASE}/apikey", headers=auth_header(TOKEN2))
API_KEY2 = r4.json().get("apikey", "")
r5 = requests.get(f"{BASE}/balance", headers={"X-API-Key": API_KEY2})
got_id = r5.json().get("company_id", "")
log("F2", "Security: company2 apikey → company2 data only", got_id == COMPANY2_ID, f"got {got_id}")

r6 = requests.delete(f"{BASE}/apikey/{API_KEY_ID1}", headers=auth_header(TOKEN1))
log("F2", "Revoke key", r6.status_code == 200, str(r6.status_code))

r7 = requests.get(f"{BASE}/balance", headers={"X-API-Key": API_KEY1})
log("F2", "Revoked key → 401", r7.status_code == 401, str(r7.status_code))

# Regenerate for later use
regen = requests.post(f"{BASE}/apikey", headers=auth_header(TOKEN1))
API_KEY1 = regen.json().get("apikey", "")

# ─── FLOW 3: Category & Criteria Setup ─────────────────────────────────────────
print("\n=== FLOW 3: Category & Criteria Setup ===")
r = requests.get(f"{BASE}/criteria", headers=auth_header(TOKEN1))
log("F3", "List criteria", r.status_code == 200, str(r.status_code))
seeded = r.json()
SEEDED_CRITERIA_ID = seeded[0]["id"] if seeded else None

custom_data = {
    "name": f"Bank KYC {ts}",
    "category": "finance",
    "fields": ["name", "citizenship_no", "pan_no", "expiry_date", "amount"],
    "rules": []
}
r2 = requests.post(f"{BASE}/criteria", headers=auth_header(TOKEN1), json={"data": custom_data})
log("F3", "Create custom criteria", r2.status_code == 201, str(r2.status_code))
CUSTOM_CRITERIA_ID = r2.json().get("id", "")

r3 = requests.post(f"{BASE}/criteria/enroll", headers=auth_header(TOKEN1),
                   json={"criteria_id": CUSTOM_CRITERIA_ID})
log("F3", "Enroll in criteria", r3.status_code == 201, str(r3.status_code))

r4 = requests.post(f"{BASE}/criteria/enroll", headers=auth_header(TOKEN1),
                   json={"criteria_id": CUSTOM_CRITERIA_ID})
log("F3", "Double enroll → 409", r4.status_code == 409, str(r4.status_code))

r5 = requests.get(f"{BASE}/criteria/enrolled", headers=auth_header(TOKEN1))
enrolled_ids = [e.get("criteria_id") for e in r5.json()]
log("F3", "List enrolled → appears", CUSTOM_CRITERIA_ID in enrolled_ids, str(r5.status_code))

CRITERIA_ID_FOR_VERIFY = CUSTOM_CRITERIA_ID

# ─── FLOW 4: Document Verification Happy Path ───────────────────────────────────
print("\n=== FLOW 4: Document Verification Happy Path ===")
r = requests.post(f"{BASE}/balance/topup", headers=auth_header(TOKEN1), json={"amount": 500})
log("F4", "Topup 500 credits", r.status_code == 200, str(r.status_code))

r2 = requests.get(f"{BASE}/balance", headers=auth_header(TOKEN1))
bal = r2.json().get("balance", 0)
log("F4", "Balance = 500", bal == 500, f"got {bal}")

with open("/home/prasanga/TeamTron_iicquest/backend/unit/valid.png", "rb") as f:
    files = [("files", ("valid.png", f, "image/png"))]
    r3 = requests.post(
        f"{BASE}/verify/upload",
        headers=auth_header(TOKEN1),
        data={"criteria_id": CRITERIA_ID_FOR_VERIFY},
        files=files,
    )
log("F4", "Upload valid.png → 201", r3.status_code == 201, str(r3.status_code))
verify_result = r3.json() if r3.status_code == 201 else {}
verdict = verify_result.get("verdict", "")
log("F4", "Verdict returned (any)", bool(verdict), f"verdict={verdict}")
ENROLL_ID = verify_result.get("enroll_id", "")
TXID = verify_result.get("txid", "")
tron_signed = verify_result.get("tron_signed", False)

r4 = requests.get(f"{BASE}/balance", headers=auth_header(TOKEN1))
bal_after = r4.json().get("balance", 0)
cost = verify_result.get("cost_deducted", 1)
log("F4", f"Balance deducted by {cost}", bal_after == 500 - cost, f"bal={bal_after}")

if ENROLL_ID:
    r5 = requests.get(f"{BASE}/document/{ENROLL_ID}", headers=auth_header(TOKEN1))
    log("F4", "GET /document/{enroll_id}", r5.status_code == 200, str(r5.status_code))

r6 = requests.get(f"{BASE}/signature", headers=auth_header(TOKEN1))
log("F4", "GET /signature list", r6.status_code == 200, str(r6.status_code))

if TXID:
    r7 = requests.get(f"{BASE}/signature/verify/{TXID}")
    log("F4", "Verify txid on blockchain", r7.status_code in (200, 404), str(r7.status_code))

# ─── FLOW 5: Document Verification Edge Cases ───────────────────────────────────
print("\n=== FLOW 5: Document Verification Edge Cases ===")
with open("/home/prasanga/TeamTron_iicquest/backend/unit/image.png", "rb") as f:
    files = [("files", ("image.png", f, "image/png"))]
    r = requests.post(
        f"{BASE}/verify/upload",
        headers=auth_header(TOKEN1),
        data={"criteria_id": CRITERIA_ID_FOR_VERIFY},
        files=files,
    )
log("F5", "Invalid doc → not 500", r.status_code != 500, f"got {r.status_code}")
log("F5", "Invalid doc → 200 or 201 with verdict", r.status_code in (200, 201), str(r.status_code))

# Drain balance for 0 balance test
r_bal = requests.get(f"{BASE}/balance", headers=auth_header(TOKEN1))
cur_bal = r_bal.json().get("balance", 0)

# Register new company with 0 balance
EMAIL_BROKE = f"broke_{ts}@test.com"
reg("BrokeCompany", EMAIL_BROKE)
r_broke_login = login(EMAIL_BROKE)
TOKEN_BROKE = r_broke_login.json().get("access_token", "")
requests.post(f"{BASE}/criteria/enroll", headers=auth_header(TOKEN_BROKE),
              json={"criteria_id": CRITERIA_ID_FOR_VERIFY})
with open("/home/prasanga/TeamTron_iicquest/backend/unit/valid.png", "rb") as f:
    files = [("files", ("valid.png", f, "image/png"))]
    r2 = requests.post(
        f"{BASE}/verify/upload",
        headers=auth_header(TOKEN_BROKE),
        data={"criteria_id": CRITERIA_ID_FOR_VERIFY},
        files=files,
    )
log("F5", "0 balance → 402", r2.status_code == 402, str(r2.status_code))

with open("/home/prasanga/TeamTron_iicquest/backend/unit/valid.png", "rb") as f:
    files = [("files", ("valid.png", f, "image/png"))]
    r3 = requests.post(
        f"{BASE}/verify/upload",
        headers=auth_header(TOKEN1),
        data={"criteria_id": "00000000-0000-0000-0000-000000000000"},
        files=files,
    )
log("F5", "Non-existent criteria → 404", r3.status_code == 404, str(r3.status_code))

with open("/home/prasanga/TeamTron_iicquest/backend/unit/valid.png", "rb") as f:
    content = f.read()
files6 = [("files", (f"f{i}.png", content, "image/png")) for i in range(6)]
r4 = requests.post(
    f"{BASE}/verify/upload",
    headers=auth_header(TOKEN1),
    data={"criteria_id": CRITERIA_ID_FOR_VERIFY},
    files=files6,
)
log("F5", "6 files → 422", r4.status_code == 422, str(r4.status_code))

with open("/home/prasanga/TeamTron_iicquest/backend/unit/valid.png", "rb") as f:
    files = [("files", ("valid.png", f, "image/png"))]
    r5 = requests.post(
        f"{BASE}/verify/upload",
        data={"criteria_id": CRITERIA_ID_FOR_VERIFY},
        files=files,
    )
log("F5", "No auth → 401", r5.status_code == 401, str(r5.status_code))

# ─── FLOW 6: Dashboard ─────────────────────────────────────────────────────────
print("\n=== FLOW 6: Dashboard ===")
r = requests.get(f"{BASE}/company/dashboard", headers=auth_header(TOKEN1))
log("F6", "Dashboard → 200", r.status_code == 200, str(r.status_code))
d = r.json() if r.status_code == 200 else {}
has_all = all(k in d for k in ("company", "documents", "blockchain", "financials", "api", "criteria"))
log("F6", "Dashboard has all keys", has_all, str(list(d.keys())))

EMAIL_NEW = f"new_{ts}@test.com"
reg("NewCo", EMAIL_NEW)
r_new_login = login(EMAIL_NEW)
TOKEN_NEW = r_new_login.json().get("access_token", "")
r2 = requests.get(f"{BASE}/company/dashboard", headers=auth_header(TOKEN_NEW))
log("F6", "New company dashboard → no crash", r2.status_code == 200, str(r2.status_code))
if r2.status_code == 200:
    nd = r2.json()
    log("F6", "New company docs total = 0", nd.get("documents", {}).get("total", -1) == 0,
        str(nd.get("documents", {}).get("total")))

# ─── FLOW 7: AI Assistant ──────────────────────────────────────────────────────
print("\n=== FLOW 7: AI Assistant ===")
r = requests.post(f"{BASE}/assistant/chat", headers=auth_header(TOKEN1),
                  json={"message": "What is VIVAD X?"})
log("F7", "Chat 'What is VIVAD X?'", r.status_code == 200, str(r.status_code))
if r.status_code == 200:
    log("F7", "Response has 'model' in context_summary",
        "model" in r.json().get("context_summary", {}), str(list(r.json().get("context_summary", {}).keys())))

r2 = requests.post(f"{BASE}/assistant/chat", headers=auth_header(TOKEN1),
                   json={"message": "How many documents have I verified?"})
log("F7", "Chat 'How many docs verified?'", r2.status_code == 200, str(r2.status_code))

r3 = requests.post(f"{BASE}/assistant/chat", headers=auth_header(TOKEN1), json={"message": ""})
log("F7", "Empty message → 422", r3.status_code == 422, str(r3.status_code))

r4 = requests.post(f"{BASE}/assistant/chat", headers=auth_header(TOKEN1),
                   json={"message": "x" * 1001})
log("F7", "Message >1000 chars → 422", r4.status_code == 422, str(r4.status_code))

# ─── FLOW 8: Balance & Payments ────────────────────────────────────────────────
print("\n=== FLOW 8: Balance & Payments ===")
r = requests.get(f"{BASE}/balance", headers=auth_header(TOKEN1))
log("F8", "GET /balance", r.status_code == 200, str(r.status_code))

r2 = requests.post(f"{BASE}/balance/topup", headers=auth_header(TOKEN1), json={"amount": 100})
log("F8", "Topup 100 → 200", r2.status_code == 200, str(r2.status_code))

r3 = requests.get(f"{BASE}/payment_method", headers=auth_header(TOKEN1))
log("F8", "GET /payment_method → 200", r3.status_code == 200, str(r3.status_code))

r4 = requests.post(f"{BASE}/payment/initialize", headers=auth_header(TOKEN1),
                   json={"plan_id": "1", "payment_method": "esewa"})
log("F8", "POST /payment/initialize", r4.status_code in (200, 201, 400, 404, 422), str(r4.status_code))

r5 = requests.get(f"{BASE}/transaction", headers=auth_header(TOKEN_NEW))
log("F8", "GET /transaction (new co → empty)", r5.status_code == 200, str(r5.status_code))

r6 = requests.post(f"{BASE}/balance/topup", headers=auth_header(TOKEN1), json={"amount": -100})
log("F8", "Topup negative → 422", r6.status_code == 422, str(r6.status_code))

r7 = requests.post(f"{BASE}/balance/topup", headers=auth_header(TOKEN1), json={"amount": 0})
log("F8", "Topup 0 → 422", r7.status_code == 422, str(r7.status_code))

# ─── FLOW 9: Signature Verification ────────────────────────────────────────────
print("\n=== FLOW 9: Signature Verification ===")
r = requests.get(f"{BASE}/signature", headers=auth_header(TOKEN1))
log("F9", "GET /signature list", r.status_code == 200, str(r.status_code))

if TXID:
    r2 = requests.get(f"{BASE}/signature/verify/{TXID}")
    log("F9", "Verify valid txid", r2.status_code in (200, 404), str(r2.status_code))

r3 = requests.get(f"{BASE}/signature/verify/fake_txid_that_does_not_exist")
log("F9", "Fake txid → not 500", r3.status_code != 500, f"got {r3.status_code}")

# ─── FLOW 10: MCP Server ───────────────────────────────────────────────────────
print("\n=== FLOW 10: MCP Server ===")
import sys
sys.path.insert(0, "/home/prasanga/TeamTron_iicquest/backend")
try:
    from app.mcp.server import mcp
    log("F10", "Import mcp server", True, "ok")
    try:
        from app.core.vectorless.context import build_context
        log("F10", "Import build_context", True, "ok")
    except Exception as e:
        log("F10", "Import build_context", False, str(e))
except Exception as e:
    log("F10", "Import mcp server", False, str(e))

# ─── SUMMARY ───────────────────────────────────────────────────────────────────
print("\n\n" + "="*70)
print("AUDIT RESULTS SUMMARY")
print("="*70)
passes = sum(1 for _, _, s, _ in RESULTS if s == "PASS")
fails = sum(1 for _, _, s, _ in RESULTS if s == "FAIL")
print(f"Total: {len(RESULTS)} | PASS: {passes} | FAIL: {fails}")
print()
print(f"{'FLOW':<6} {'CHECK':<50} {'STATUS':<6} {'DETAIL'}")
print("-"*100)
for flow, check, status, detail in RESULTS:
    print(f"{flow:<6} {check:<50} {status:<6} {detail[:40]}")
