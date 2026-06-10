import os
import json
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


def hash_fields(fields: dict) -> str:
    payload = json.dumps(fields, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode()).hexdigest()


def sign_on_tron(hash_value: str) -> str:
    receiver = os.getenv("TRON_RECEIVER_ADDRESS", "TBiMgwhPkZdoWAEBu3rctSdViqRNqN7Wb9")
    try:
        tx = (
            _client().trx.transfer(_from_addr(), receiver, 1)
            .memo(hash_value)
            .build()
            .sign(_priv_key())
        )
        result = tx.broadcast()
        return result["txid"]
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
