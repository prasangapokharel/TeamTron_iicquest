import os
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.core.vectorless.context import build_context
from app.service.groq.groq import _call_with_fallback

SYSTEM_PROMPT = """You are VIVAD X Assistant — an intelligent document verification advisor.
You have access to real-time company verification data provided as context below.
Answer questions accurately using ONLY the context provided. Do not make up data.
Be concise but complete. If asked about a specific document, refer to the details in context.
Format numbers clearly. When mentioning blockchain transactions, include the verify_url."""

MODEL = "llama-3.3-70b-versatile"


def chat(db: Session, company_id: str, message: str) -> dict:
    if not message or not message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")
    if len(message) > 1000:
        raise HTTPException(status_code=422, detail="Message too long (max 1000 chars)")

    context = build_context(db, company_id)

    try:
        response = _call_with_fallback(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"=== CONTEXT ===\n{context}\n\n=== QUESTION ===\n{message}"},
            ],
            model=MODEL,
            temperature=0.2,
            max_completion_tokens=1024,
        )
        answer = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    return {
        "question": message,
        "answer": answer,
        "context_summary": {
            "data_source": "live_db",
            "vectorless": True,
        },
    }
