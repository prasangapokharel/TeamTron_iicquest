## 1. Project Title

**VivadX** — Smart Document Reconciliation & Verification

---

## Why they need it most:

**500,000+** Nepali workers go abroad yearly
Every worker needs 6–8 documents verified
Passport, medical, training cert, police clearance
Labor agreement, insurance, visa copy

**Current situation:**
Staff manually checks each document
One file takes 20–30 minutes
Fraud is rampant — fake medical certificates
Agencies get blacklisted if they send fraudulent workers

**With VivadX:**
Same verification in 30 seconds
Fraud detected automatically
Blockchain proof protects agency legally
Cost per verification: 1 credit (~1 NPR)
vs manual cost: 200–500 NPR in staff time


## 2. Team Name & Members

| | |
|---|---|
| **Team** | Tron |
| **Members** | Rahul Chaudhary · Prasanga Raman Pokharel · Bipin Limbu · Rupesh Chaudhary |

---

## 3. Problem Statement

Banks, microfinance institutions, manpower agencies, consultancies, universities, and government offices in Nepal still verify documents **manually** — one officer, one form, one field at a time.

This creates four serious problems:

- **Slow** — a single KYC or certificate review can take 5–15 minutes  
- **Expensive** — skilled staff time adds up across thousands of branches  
- **Inconsistent** — different reviewers reach different conclusions on the same document  
- **Fraud-prone** — mismatched names, expired IDs, and fake copies slip through manual checks  

With **106+ licensed BFIs** and **11,000+ branches** in Nepal, and **National ID–linked KYC** now mandatory (NRB, 2025), the verification workload is growing faster than teams can hire.

---

## 4. Solution Description

**VivadX** is a B2B document verification platform that replaces manual checks with an automated, auditable pipeline:

1. **Upload** 1–5 document images (KYC, manpower papers, university certificates, etc.)  
2. **Extract** structured fields in parallel using **Groq Llama 4 Scout** vision AI  
3. **Validate** against configurable criteria rules (cross-match, expiry, thresholds, date logic)  
4. **Score** risk (0–100) and assign a **Green / Orange / Red** verdict with clear flags  
5. **Sign** Green verifications on the **Tron blockchain** — public, tamper-proof proof via TXID  

Additional capabilities:

- **VivaAi** — context-aware assistant over your verification history and balance  
- **Spoofing check** — compare a claimed verified document (Image A) vs a presented copy (Image B)  
- **eSewa payments** — pay-per-verification credits (1 NPR ≈ 1 credit)  
- **REST API + API keys** — server-to-server integration for banks and enterprises  
- **MCP server** — AI tools (Cursor, Claude) can verify and query the platform natively  

Built-in criteria templates: **Bank KYC**, **Manpower Agency**, **University Documents** — new document types via JSON config, no code deploy.

---

## 5. Tech Stack Used

| Layer | Technologies |
|-------|----------------|
| **Languages** | Python 3, TypeScript |
| **Backend** | FastAPI, SQLAlchemy, Alembic, Pydantic, Uvicorn |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4, GSAP, Recharts |
| **Database** | PostgreSQL (Supabase) |
| **Vision AI** | Groq API — Meta Llama 4 Scout (`llama-4-scout-17b-16e-instruct`) |
| **Assistant AI** | Together AI — fine-tuned Qwen3-8B-Vivad (Groq fallback) |
| **Blockchain** | Tron Nile testnet (`tronpy`) |
| **Payments** | eSewa RC sandbox (HMAC-signed redirect flow) |
| **Auth** | JWT (dashboard), API keys (B2B), BCrypt passwords |
| **Protocol** | Model Context Protocol (MCP) via FastMCP |
| **APIs** | Groq, Together AI, TronGrid, eSewa, Supabase |

---

## 6. Setup / Installation Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase PostgreSQL database
- API keys: Groq, Together AI, Tron (Nile testnet), eSewa sandbox (optional for payments)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # fill in database, API keys, JWT secret
alembic upgrade head
python db/seed/run_all.py        # seed Bank KYC, Manpower, University criteria
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok","service":"VIVAD X"}
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open: **http://localhost:3000**

### Quick test flow

1. Register a company at `/signup`  
2. Top up credits at **Settings → Balance** (eSewa sandbox) or `POST /api/v1/balance/topup`  
3. Enroll a criteria pack at **Criteria**  
4. Upload documents at **Documents → Upload** or **Verify**  
5. View result, flags, and Tron signature at **Documents → Result**  
6. Compare spoofing at **Settings → Spoofing**  

Full documentation: [`backend/docs/project/details.md`](backend/docs/project/details.md)

---

## 7. AI Tools Used

Per IIC Quest Technology Policy (Section 10), we disclose all AI tools used in this project:

| Tool | Purpose |
|------|---------|
| **Groq (Llama 4 Scout)** | Production — document field extraction from images |
| **Together AI (Qwen3-8B-Vivad)** | Production — VivaAi assistant (fine-tuned on verification domain) |
| **Groq (Llama 3.3 70B)** | Production — assistant fallback when Together is unavailable |
| **Cursor** | Development — AI-assisted coding, debugging, and MCP integration |
| **Claude / GPT (via Cursor)** | Development — architecture, documentation, and code review assistance |

Synthetic document detection (`SYNTHETIC=True` in `.env`) uses an additional Groq vision pre-check for AI-generated mock-ups.

---

## 8. Demo Link or Screenshots

### Repository

**GitHub:** [github.com/prasangapokharel/TeamTron_iicquest](https://github.com/prasangapokharel/TeamTron_iicquest)

### Local demo

| Service | URL |
|---------|-----|
| Frontend (dashboard) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Swagger | http://localhost:8000/docs |
| Tron proof (example) | https://nile.tronscan.org |

### Screenshots

| Screen | Path |
|--------|------|
| App preview | `frontend/public/Screenshot_From_2026-06-10_17-14-53-removebg-preview.png` |
| Logo / branding | `frontend/public/logo.png` |

### Key pages to demo for judges

- `/dashboard` — verification stats and recent runs  
- `/documents/upload` — upload + AI verify  
- `/documents/{id}/result` — verdict, issues summary, blockchain proof  
- `/settings/spoofing` — Image A vs Image B spoofing detection  
- `/assistant` — VivaAi chat over live data  
- `/signatures` — on-chain signature registry  

---

## Project structure

```
TeamTron_iicquest/
├── backend/          # FastAPI API, AI pipeline, Tron signing, MCP
├── frontend/         # Next.js dashboard (VivadX)
└── README.md
```

## License

Built for **IIC Quest** — Team Tron.
