const NILE_TRONSCAN_TX = "https://nile.tronscan.org/#/transaction/";

export function isTronScanUrl(url: string): boolean {
  return /tronscan\.org/i.test(url);
}

export function resolveTronScanUrl(
  txid?: string | null,
  verifyUrl?: string | null,
): string | null {
  if (verifyUrl && isTronScanUrl(verifyUrl)) return verifyUrl;
  if (txid) return `${NILE_TRONSCAN_TX}${txid}`;
  return null;
}

export function shortTxid(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
