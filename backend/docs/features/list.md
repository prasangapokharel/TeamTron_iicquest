# VIVAD X — Core Features

**VIVAD X** is a Smart Document Reconciliation & Verification System built for
banks, cooperatives, and manpower agencies in Nepal.

---

## 1. Authentication & Company Management

- **Company Registration & Login**
  Each client is a company account with a unique profile, logo, and credentials.
  JWT-based session auth is used for the dashboard; API key auth is available
  for server-to-server integrations.
  - Technical: BCrypt password hashing, HS256 JWT tokens, Supabase PostgreSQL storage.

- **Profile Management**
  Companies can update their name, email, and logo at any time.
  - Technical: `PATCH /api/v1/company/me`, logo stored in Supabase Storage bucket.

---

## 2. Document Verification (AI-Powered)

- **Image Upload & Parallel Field Extraction**
  Upload 1–5 document images (JPG/PNG) per verification request. The AI
  extracts structured fields from each image in parallel, then merges results.
  - Technical: Uses Groq Llama 4 Scout vision model (`llama-4-scout-17b-16e-instruct`) via the Groq API.

- **Cross-Document Conflict Detection**
  After extraction, fields are compared across all uploaded images. Any
  mismatch (e.g., Name differs between citizenship and letter) is flagged.
  - Technical: `cross_match` rule engine in `app/utils/severity.py`.

- **Verdict Engine (Green / Orange / Red)**
  A risk score is computed from flags. Score ≥ 80 → Green (verified),
  50–79 → Orange (review required), < 50 → Red (failed).
  - Technical: `compute_risk_score()` + `get_verdict()` driven by per-rule severity weights.

- **File Upload Endpoint**
  Accepts `multipart/form-data` with up to 5 images and a `criteria_id`.
  - Technical: `POST /api/v1/verify/upload` saves images to local `uploads/` and calls the verify service.

---

## 3. Dynamic Criteria Engine

- **Criteria Templates**
  A criteria defines which fields to extract and which rules to apply.
  Two built-in criteria are seeded: **Bank KYC** and **Manpower Agency**.
  Companies can also create custom criteria.
  - Technical: Criteria stored as JSONB in PostgreSQL; loaded at verify time.

- **Bank KYC Criteria**
  Extracts: Name, Father Name, Citizenship No., PAN No., Expiry Date, Address,
  Amount, Document Type. Red rules: name/citizenship/PAN mismatch, expired doc.
  Orange rules: father name variation, address mismatch, income below threshold (NPR 10,000).

- **Manpower Agency Criteria**
  Extracts: Name, Father Name, Agency Name, License No., Amount/Salary,
  Destination, Expiry Date, Payment Date, Deployment Date.
  Red rules: name/salary/destination/license mismatch, expired license, payment
  after deployment date (impossible date logic), agency name variation.

- **Criteria Enrollment**
  Companies enroll criteria to activate them. Each enrollment sets severity
  level and a custom message for that company's context.
  - Technical: `POST /api/v1/criteria/enroll`, many-to-many via `criteria_enroll` table.

---

## 4. Blockchain Signing (Tron)

- **Immutable Verification Proof**
  Every document that receives a Green verdict is signed on the Tron blockchain
  (Nile testnet). The document's extracted fields are SHA-256 hashed and the
  hash is submitted as a Tron transaction.
  - Technical: `app/service/tron/tron.py` — uses `tronpy` to broadcast to Nile testnet.

- **Public Verifiability**
  The transaction ID (txid) is stored and a direct link to TronScan is returned:
  `https://nile.tronscan.org/#/transaction/<txid>`.
  Anyone can independently verify the on-chain record.

- **Signature Storage**
  Each signature is stored with its `txid`, `to_address`, and `hash` for
  audit retrieval.
  - Technical: `GET /api/v1/signature` and `GET /api/v1/signature/:enroll_id`.

---

## 5. Balance & Credit System

- **Credit Model**
  1 NPR = 1 credit. 1 credit = 1 document verification. Balance is checked
  before every verification; requests with 0 balance return HTTP 402.
  - Technical: `Balance` table per company; decremented atomically after each verify.

- **Balance API**
  Companies can check their balance programmatically via API key.
  - Technical: `GET /api/v1/balance` accepts both JWT and `X-Api-Key`.

- **Abuse Prevention**
  Insufficient balance blocks all verification attempts. No verification is
  processed without a successful credit deduction.

---

## 6. eSewa Payment Integration

- **Nepal-Native Payment Gateway**
  Companies top up their credit balance using eSewa, Nepal's leading digital
  payment platform. Amount in NPR directly converts to credits (1:1).
  - Technical: HMAC-SHA256 signed payment requests to eSewa RC sandbox
    (`rc-epay.esewa.com.np`).

- **Full Redirect Flow**
  Backend initializes the payment, returns form fields for a POST redirect to
  eSewa. On return, eSewa's signed response is verified server-side before
  credits are added.
  - Technical: `POST /api/v1/payment/initialize` → `GET /api/v1/payment/success` callback.

- **Transaction History**
  All payment transactions (pending/success/failed) are stored and queryable.
  - Technical: `GET /api/v1/transaction`.

---

## 7. AI Assistant (Fine-Tuned VIVAD Model)

- **Context-Aware Chat**
  The assistant answers questions about the company's own verifications,
  balance, documents, and platform usage using live database context injected
  into each prompt.
  - Technical: `POST /api/v1/assistant/chat` — queries live DB, builds context,
    calls the fine-tuned model via Together AI.

- **Fine-Tuned Model**
  A Qwen3-8B model fine-tuned on VIVAD X domain data
  (`incpractical_b3ab/Qwen3-8B-Vivad-b073dc2a-4f79c591`) is served via
  Together AI's inference API. This is a proprietary model trained on
  verification workflows, criteria definitions, and domain vocabulary.
  - Technical: Together AI API, model ID stored in env.

---

## 8. MCP Server Integration

- **AI Tool Exposure**
  VIVAD X runs a Model Context Protocol (MCP) server that exposes 6 tools.
  Any MCP client (Cursor, Claude Desktop) can call these tools directly,
  enabling AI-native document verification workflows.
  - Technical: `app/mcp/server.py` using `mcp.server.fastmcp.FastMCP`.

- **Tools Exposed**
  `get_dashboard`, `get_balance`, `list_criteria`, `get_verification_history`,
  `ask_assistant`, `verify_document`.

- **Auth via API Key**
  The MCP server authenticates to VIVAD X using the company's API key set in
  the `VIVAD_API_KEY` environment variable. No user session required.

---

## 9. API Key Authentication

- **Key Generation & Revocation**
  Companies generate long-lived API keys via the dashboard or API. Keys can
  be revoked instantly. Multiple keys are supported (one per integration).
  - Technical: `POST /api/v1/apikey` (JWT required); keys stored hashed in DB.

- **B2B Integration**
  API key auth (`X-Api-Key` header) is accepted on verify, balance, and
  assistant endpoints. Designed for server-to-server use without session
  management.

---

## 10. Dashboard & Analytics

- **Company Dashboard**
  Single endpoint returns all stats: total/verified/failed/pending document
  counts, verification rate %, blockchain signatures count, total spend (NPR),
  active API keys, enrolled criteria count, and last 5 verifications.
  - Technical: `GET /api/v1/company/dashboard` aggregates across 6 tables in one call.

- **Recent Verifications Feed**
  Each entry shows criteria name, status badge, verdict color, risk score, and
  a direct TronScan link for blockchain-signed documents.

- **Document History**
  Full paginated list of all past verifications with per-document result detail.
  - Technical: `GET /api/v1/document` and `GET /api/v1/document/:id/result`.
