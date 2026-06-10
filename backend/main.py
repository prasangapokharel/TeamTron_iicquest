import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.auth.route import router as auth_router
from app.api.v1.company.route import router as company_router
from app.api.v1.category.route import router as category_router
from app.api.v1.critaria.route import router as criteria_router
from app.api.v1.document.route import router as document_router
from app.api.v1.signature.route import router as signature_router
from app.api.v1.apikey.route import router as apikey_router
from app.api.v1.plan.route import router as plan_router
from app.api.v1.payment.route import router as payment_router
from app.api.v1.verify.route import router as verify_router
from app.api.v1.assistant.route import router as assistant_router

os.makedirs("bucket/logo", exist_ok=True)

app = FastAPI(
    title="VIVAD X",
    description="Smart Document Reconciliation & Verification System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(auth_router, prefix=PREFIX)
app.include_router(company_router, prefix=PREFIX)
app.include_router(category_router, prefix=PREFIX)
app.include_router(criteria_router, prefix=PREFIX)
app.include_router(document_router, prefix=PREFIX)
app.include_router(signature_router, prefix=PREFIX)
app.include_router(apikey_router, prefix=PREFIX)
app.include_router(plan_router, prefix=PREFIX)
app.include_router(payment_router, prefix=PREFIX)
app.include_router(verify_router, prefix=PREFIX)
app.include_router(assistant_router, prefix=PREFIX)


app.mount("/bucket", StaticFiles(directory="bucket"), name="bucket")


@app.get("/health")
def health():
    return {"status": "ok", "service": "VIVAD X"}
