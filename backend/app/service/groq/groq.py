import os
import base64
import json
import concurrent.futures
from typing import Any
from dotenv import load_dotenv

load_dotenv()

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
MAX_PARALLEL = 2

_API_KEY_ENV_VARS = [
    "GROQ_API_KEY",
    "GROQ_API_KEY2",
    "GROQ_API_KEY3",
    "GROQ_API_KEY4",
    "GROQ_API_KEY5",
]


def _call_with_fallback(messages: list[dict], **kwargs) -> Any:
    """
    Try each GROQ_API_KEY in order. Falls back to the next key on any
    RateLimitError, AuthenticationError, or credit exhaustion (status 429/402).
    Raises the last exception if all keys fail.
    """
    from groq import Groq
    from groq import RateLimitError, AuthenticationError

    last_exc: Exception | None = None
    for env_var in _API_KEY_ENV_VARS:
        key = os.getenv(env_var)
        if not key:
            continue
        try:
            client = Groq(api_key=key)
            return client.chat.completions.create(messages=messages, **kwargs)
        except (RateLimitError, AuthenticationError) as e:
            last_exc = e
            continue
        except Exception as e:
            # Catch HTTP 402 / credit exhaustion by status code if raised as generic error
            msg = str(e).lower()
            if any(code in msg for code in ("402", "429", "rate_limit", "exceeded", "credit", "quota")):
                last_exc = e
                continue
            raise

    raise last_exc or RuntimeError("No GROQ API keys configured")


def _encode_image(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def _image_content(path: str) -> dict:
    if path.startswith(("http://", "https://")):
        return {"url": path}
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}.get(ext, "image/jpeg")
    return {"url": f"data:{mime};base64,{_encode_image(path)}"}


def _check_synthetic(path: str) -> bool:
    try:
        completion = _call_with_fallback(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Is this a real photograph or scan of a physical paper document, "
                                "or an AI-generated / synthetic / digital mock-up? "
                                'Return ONLY JSON: {"is_synthetic": true} or {"is_synthetic": false}'
                            ),
                        },
                        {"type": "image_url", "image_url": _image_content(path)},
                    ],
                }
            ],
            model=MODEL,
            temperature=0,
            max_completion_tokens=64,
            response_format={"type": "json_object"},
        )
        data = json.loads(completion.choices[0].message.content)
        return _is_truthy(data.get("is_synthetic"))
    except Exception:
        return False


def _extract_single(path: str, criteria_data: dict) -> dict[str, Any]:
    from app.core.prompts.base import build_extraction_prompt, _synthetic_enabled

    fields = criteria_data.get("fields", [])
    if _synthetic_enabled() and _check_synthetic(path):
        return {"is_synthetic": True, **{f: None for f in fields}}

    prompt = build_extraction_prompt(criteria_data)
    try:
        completion = _call_with_fallback(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": _image_content(path)},
                    ],
                }
            ],
            model=MODEL,
            temperature=0.1,
            max_completion_tokens=1024,
            response_format={"type": "json_object"},
        )
        text = completion.choices[0].message.content
        data = json.loads(text)
        if not _synthetic_enabled():
            data.pop("is_synthetic", None)
        return data
    except Exception as e:
        return {"_error": str(e), "_path": path}


def extract_parallel(paths: list[str], criteria_data: dict) -> list[dict]:
    """Process images in parallel (MAX_PARALLEL=2 at a time per flow spec)."""
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        futures = {executor.submit(_extract_single, p, criteria_data): p for p in paths}
        for future in concurrent.futures.as_completed(futures):
            results.append({"path": futures[future], "extracted": future.result()})
    return results


def _is_truthy(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("true", "1", "yes")
    return False


def merge_extractions(
    results: list[dict],
    fields: list[str],
    *,
    synthetic_check: bool = False,
) -> dict:
    """
    Merge field extractions from multiple document images.
    First non-null value wins per field; value disagreements are recorded as conflicts.
    Synthetic images are excluded from the merge when synthetic_check is enabled.
    """
    merged: dict[str, Any] = {}
    conflicts: dict[str, list] = {}
    is_synthetic = False
    synthetic_count = 0

    for r in results:
        extracted = r.get("extracted", {})
        if "_error" in extracted:
            continue
        doc_synthetic = synthetic_check and _is_truthy(extracted.get("is_synthetic"))
        if doc_synthetic:
            is_synthetic = True
            synthetic_count += 1
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

    return {
        "fields": merged,
        "conflicts": conflicts,
        "is_synthetic": is_synthetic,
        "synthetic_count": synthetic_count,
        "total_documents": len(results),
    }
