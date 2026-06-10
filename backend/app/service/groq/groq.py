import os
import base64
import json
import concurrent.futures
from functools import lru_cache
from typing import Any
from dotenv import load_dotenv

load_dotenv()

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
MAX_PARALLEL = 2


@lru_cache(maxsize=1)
def _client():
    from groq import Groq
    return Groq(api_key=os.getenv("GROQ_API_KEY"))


def _encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def _image_content(path: str) -> dict:
    if path.startswith(("http://", "https://")):
        return {"url": path}
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/jpeg")
    return {"url": f"data:{mime};base64,{_encode_image(path)}"}


def _extract_single(path: str, fields: list[str], category: str) -> dict[str, Any]:
    from app.core.prompts.base import build_extraction_prompt
    prompt = build_extraction_prompt(fields, category)
    try:
        completion = _client().chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": _image_content(path)},
                    ],
                }
            ],
            temperature=0.1,
            max_completion_tokens=1024,
            response_format={"type": "json_object"},
        )
        text = completion.choices[0].message.content
        return json.loads(text)
    except Exception as e:
        return {"_error": str(e), "_path": path}


def extract_parallel(paths: list[str], fields: list[str], category: str) -> list[dict]:
    """Process images in parallel (MAX_PARALLEL=2 at a time per flow spec)."""
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        futures = {executor.submit(_extract_single, p, fields, category): p for p in paths}
        for future in concurrent.futures.as_completed(futures):
            results.append({"path": futures[future], "extracted": future.result()})
    return results


def merge_extractions(results: list[dict], fields: list[str]) -> dict:
    """
    Merge field extractions from multiple document images.
    First non-null value wins per field; value disagreements are recorded as conflicts.
    """
    merged: dict[str, Any] = {}
    conflicts: dict[str, list] = {}

    for r in results:
        extracted = r.get("extracted", {})
        if "_error" in extracted:
            continue
        for field in fields:
            value = extracted.get(field)
            if value is None:
                continue
            if field not in merged:
                merged[field] = value
            elif str(merged[field]).strip().lower() != str(value).strip().lower():
                conflicts.setdefault(field, [merged[field]])
                if value not in conflicts[field]:
                    conflicts[field].append(value)

    return {"fields": merged, "conflicts": conflicts}
