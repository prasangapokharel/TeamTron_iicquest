import hashlib
import io
from PIL import Image


def compute_file_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compute_phash(data: bytes) -> str:
    img = Image.open(io.BytesIO(data)).convert("L").resize((8, 8), Image.LANCZOS)
    pixels = list(img.getdata())
    avg = sum(pixels) / len(pixels)
    bits = "".join("1" if p >= avg else "0" for p in pixels)
    return hex(int(bits, 2))[2:].zfill(16)


def phash_distance(h1: str, h2: str) -> int:
    b1 = bin(int(h1, 16))[2:].zfill(64)
    b2 = bin(int(h2, 16))[2:].zfill(64)
    return sum(c1 != c2 for c1, c2 in zip(b1, b2))


def extract_meta(data: bytes, filename: str = "", mime_type: str = "") -> dict:
    meta = {
        "file_hash": compute_file_hash(data),
        "file_size": len(data),
        "mime_type": mime_type,
        "original_filename": filename,
        "phash": None,
        "width": None,
        "height": None,
    }
    try:
        img = Image.open(io.BytesIO(data))
        meta["width"], meta["height"] = img.size
        meta["phash"] = compute_phash(data)
    except Exception:
        pass
    return meta
