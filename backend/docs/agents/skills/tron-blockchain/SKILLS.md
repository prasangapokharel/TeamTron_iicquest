from tronpy import Tron
from tronpy.providers import HTTPProvider
from tronpy.keys import PrivateKey
import hashlib

PRIVATE_KEY = "22ae7351e0a445f56b1e1b1b1ed22249d20d3f5b02593506a00b30023390ee11"

client = Tron(
    HTTPProvider(
        "https://nile.trongrid.io",
        api_key="0f845ecc-b566-46a1-89b8-fb4da8422974"
    )
)

priv_key = PrivateKey(bytes.fromhex(PRIVATE_KEY))

data = "Crop Report"
hash_value = hashlib.sha256(data.encode()).hexdigest()

from_addr = priv_key.public_key.to_base58check_address()

# 👇 use ANY other valid TRON test address
to_addr = "TBiMgwhPkZdoWAEBu3rctSdViqRNqN7Wb9"

tx = (
    client.trx.transfer(
        from_addr,
        to_addr,   # NOT same address
        1
    )
    .memo(hash_value)
    .build()
    .sign(priv_key)
)

res = tx.broadcast()

print("TXID:", res["txid"])