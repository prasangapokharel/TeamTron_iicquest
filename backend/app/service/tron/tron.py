import os
import json
import secrets
import hashlib
from functools import lru_cache
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def _client():
    from tronpy import Tron
    from tronpy.providers import HTTPProvider
    return Tron(HTTPProvider(
        os.getenv("TRON_GRID_API", "https://nile.trongrid.io"),
        api_key=os.getenv("TRON_API_KEY"),
    ))


@lru_cache(maxsize=1)
def _priv_key():
    from tronpy.keys import PrivateKey
    return PrivateKey(bytes.fromhex(os.getenv("TRON_PRIVATE_KEY", "")))


def _from_addr() -> str:
    return _priv_key().public_key.to_base58check_address()


def _generate_address() -> str:
    """
    Generate a unique ephemeral TRON address for this document signing.
    Each verified document gets its own on-chain identity (to_addr).
    """
    from tronpy.keys import PrivateKey
    priv = PrivateKey(secrets.token_bytes(32))
    return priv.public_key.to_base58check_address()


def hash_fields(fields: dict) -> str:
    payload = json.dumps(fields, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode()).hexdigest()


def sign_on_tron(hash_value: str) -> dict:
    """
    Sign a document hash on Tron.

    Flow per db.txt:
      1. Generate unique to_addr for this document
      2. Send 1 SUN from_addr → to_addr with hash as memo
      3. Return {txid, to_address}

    Caller must:
      1. create(Signature, hash=..., txid=..., to_address=...)
      2. update(DocumentEnroll, status=verified)   ← AFTER signature
    """
    to_addr = _generate_address()
    try:
        tx = (
            _client().trx.transfer(_from_addr(), to_addr, 1)
            .memo(hash_value)
            .build()
            .sign(_priv_key())
        )
        result = tx.broadcast()
        return {"txid": result["txid"], "to_address": to_addr}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Tron signing failed: {str(e)}")


def get_transaction(txid: str) -> dict:
    try:
        tx = _client().get_transaction(txid)
        memo_hex = tx.get("raw_data", {}).get("data", "")
        memo = bytes.fromhex(memo_hex).decode("utf-8") if memo_hex else ""
        return {
            "txid": txid,
            "status": "confirmed",
            "hash": memo,
            "verify_url": f"https://nile.tronscan.org/#/transaction/{txid}",
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Transaction not found: {str(e)}")


def get_wallet_address() -> str:
    return _from_addr()
