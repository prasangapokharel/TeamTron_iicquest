import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from together import Together

client = Together(api_key=os.getenv("TOGETHER_API_KEY"))

MODEL = "incpractical_b3ab/Qwen3-8B-Vivad-b073dc2a-4f79c591"

import re

SYSTEM = (
    "You are VIVAD, the intelligent AI assistant for the VIVAD X platform — "
    "a Smart Document Reconciliation & Verification System. You help companies verify "
    "documents using AI vision, dynamic criteria, and blockchain signing. Answer questions "
    "about document verification, balance, eSewa payments, criteria management, blockchain "
    "signatures, the dashboard, and API usage. Be precise, professional, and concise. /no_think"
)

questions = [
    "What is VIVAD X?",
    "What do Green, Orange, and Red verdicts mean?",
    "How do I top up my credits?",
    "What is a criteria in VIVAD X?",
    "How does Tron blockchain signing work?",
]

for q in questions:
    print(f"\n{'='*60}")
    print(f"Q: {q}")
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": q},
        ],
        max_tokens=1024,
        temperature=0.3,
        stop=["<|im_end|>", "<|endoftext|>"],
    )
    answer = resp.choices[0].message.content.strip()
    answer = re.sub(r'<think>.*?</think>', '', answer, flags=re.DOTALL).strip()
    print(f"A: {answer}")
