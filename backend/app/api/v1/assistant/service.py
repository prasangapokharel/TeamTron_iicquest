import os
import re
from sqlalchemy.orm import Session
from fastapi import HTTPException
from together import Together

from app.core.vectorless.context import build_context
from app.service.groq.groq import _call_with_fallback

TOGETHER_MODEL = os.getenv("TOGETHER_MODEL", "incpractical_b3ab/Qwen3-8B-Vivad-b073dc2a-4f79c591")
GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = (
    "You are VIVAD, the intelligent AI assistant for the VIVAD X platform — "
    "a Smart Document Reconciliation & Verification System. You help companies verify "
    "documents using AI vision, dynamic criteria, and blockchain signing. "
    "You have access to real-time company data provided as context. "
    "Answer using ONLY the context when it is available. Be precise, professional, and concise. "
    "When mentioning blockchain transactions, include the verify_url. /no_think"
)

_together = Together(api_key=os.getenv("TOGETHER_API_KEY"))

def _ask_together(messages: list) -> str:
    resp = _together.chat.completions.create(
        model=TOGETHER_MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.3,
        stop=["<|im_end|>", "<|endoftext|>"],
    )
    answer = resp.choices[0].message.content.strip()
    return re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()


def chat(db: Session, company_id: str, message: str) -> dict:
    if not message or not message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    if len(message) > 1000:
        raise HTTPException(status_code=422, detail="Message too long (max 1000 chars)")

    context = build_context(db, company_id)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"=== CONTEXT ===\n{context}\n\n=== QUESTION ===\n{message}"},
    ]

    model_used = TOGETHER_MODEL
    try:
        answer = _ask_together(messages)
    except Exception:
        try:
            resp = _call_with_fallback(
                messages=messages,
                model=GROQ_FALLBACK_MODEL,
                temperature=0.3,
                max_completion_tokens=1024,
            )
            answer = resp.choices[0].message.content.strip()
            model_used = GROQ_FALLBACK_MODEL
        except Exception as fe:
            raise HTTPException(status_code=502, detail=f"AI service error: {str(fe)}")

    return {
        "question": message,
        "answer": answer,
        "context_summary": {
            "data_source": "live_db",
            "vectorless": True,
            "model": model_used,
        },
    }
