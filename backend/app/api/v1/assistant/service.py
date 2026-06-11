import os
from sqlalchemy.orm import Session
from fastapi import HTTPException
from together import Together

from app.core.vectorless.context import build_context

MODEL = "incpractical_b3ab/Qwen3-8B-Vivad-b073dc2a-4f79c591"

SYSTEM_PROMPT = (
    "You are VIVAD, the intelligent AI assistant for the VIVAD X platform — "
    "a Smart Document Reconciliation & Verification System. You help companies verify "
    "documents using AI vision, dynamic criteria, and blockchain signing. "
    "You have access to real-time company data provided as context. "
    "Answer using ONLY the context when it is available. Be precise, professional, and concise. "
    "When mentioning blockchain transactions, include the verify_url."
)

_client = Together(api_key=os.getenv("TOGETHER_API_KEY"))


def chat(db: Session, company_id: str, message: str) -> dict:
    if not message or not message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    if len(message) > 1000:
        raise HTTPException(status_code=422, detail="Message too long (max 1000 chars)")

    context = build_context(db, company_id)

    try:
        resp = _client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"=== CONTEXT ===\n{context}\n\n=== QUESTION ===\n{message}"},
            ],
            max_tokens=2048,
            temperature=0.3,
            stop=["<|im_end|>", "<|endoftext|>"],
        )
        answer = resp.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    return {
        "question": message,
        "answer": answer,
        "context_summary": {
            "data_source": "live_db",
            "vectorless": True,
            "model": MODEL,
        },
    }
