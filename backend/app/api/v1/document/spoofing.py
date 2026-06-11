from sqlalchemy.orm import Session
from app.helper.crude import read
from app.utils.image_meta import extract_meta, phash_distance
from db.models.signature_proof import SignatureProof


def verify_spoofing(
    db: Session,
    file_a_bytes: bytes,
    filename_a: str,
    file_b_bytes: bytes,
    filename_b: str,
) -> dict:
    meta_a = extract_meta(file_a_bytes, filename_a)
    meta_b = extract_meta(file_b_bytes, filename_b)

    proof = db.query(SignatureProof).filter_by(file_hash=meta_a["file_hash"]).first()

    exact_match = meta_a["file_hash"] == meta_b["file_hash"]

    phash_dist = None
    similarity_pct = None
    if meta_a["phash"] and meta_b["phash"]:
        phash_dist = phash_distance(meta_a["phash"], meta_b["phash"])
        similarity_pct = round((1 - phash_dist / 64) * 100, 1)

    if exact_match:
        verdict = "IDENTICAL"
    elif phash_dist is not None and phash_dist <= 10:
        verdict = "SIMILAR"
    else:
        verdict = "DIFFERENT"

    spoofing_detected = not exact_match and proof is not None

    if exact_match:
        message = "✅ Documents are identical — no spoofing detected"
    elif proof is not None:
        message = "⚠️ Image A is a verified document but Image B is DIFFERENT — potential spoofing attempt detected"
    else:
        message = "ℹ️ Image A has no verification record on file"

    return {
        "image_a": {
            "filename": filename_a,
            "file_hash": meta_a["file_hash"],
            "dimensions": f"{meta_a['width']}x{meta_a['height']}",
            "file_size": meta_a["file_size"],
            "phash": meta_a["phash"],
            "is_verified": proof is not None,
            "verified_at": proof.created_at.isoformat() if proof else None,
        },
        "image_b": {
            "filename": filename_b,
            "file_hash": meta_b["file_hash"],
            "dimensions": f"{meta_b['width']}x{meta_b['height']}",
            "file_size": meta_b["file_size"],
            "phash": meta_b["phash"],
        },
        "comparison": {
            "exact_match": exact_match,
            "phash_distance": phash_dist,
            "similarity_percent": similarity_pct,
            "verdict": verdict,
        },
        "spoofing_detected": spoofing_detected,
        "message": message,
    }
