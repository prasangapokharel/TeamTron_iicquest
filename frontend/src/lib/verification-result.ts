import type { DocumentDetail, VerificationResult } from "@/types/api";

/** Normalize API shapes so result UI works with GET /result and GET /document fallbacks. */
export function normalizeVerificationResult(
  raw: VerificationResult | DocumentDetail,
): VerificationResult {
  const base = raw as VerificationResult;
  const detail = raw as DocumentDetail;

  const criteria =
    base.criteria ??
    (detail.criteria_name
      ? {
          id: "",
          name: detail.criteria_name,
          category: detail.criteria_category ?? "",
        }
      : undefined);

  return {
    ...base,
    enroll_id: base.enroll_id ?? detail.enroll_id,
    document_enroll_id: base.document_enroll_id ?? base.enroll_id ?? detail.enroll_id,
    paths: base.paths ?? detail.paths ?? [],
    status: base.status ?? detail.status,
    verdict: base.verdict ?? detail.verdict,
    risk_score: base.risk_score ?? detail.risk_score,
    tron_signed: base.tron_signed ?? detail.tron_signed,
    criteria,
  };
}

export function hasSyntheticSignal(result: VerificationResult): boolean {
  if (result.is_synthetic === true || (result.synthetic_count ?? 0) > 0) {
    return true;
  }
  if (result.is_synthetic === false && result.synthetic_count === 0) {
    return false;
  }
  return Boolean(
    result.flags?.some((f) => f.field === "image" && f.value === "synthetic"),
  );
}
