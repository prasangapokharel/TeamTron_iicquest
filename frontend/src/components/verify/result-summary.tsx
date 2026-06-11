"use client";

import { ShieldCheck } from "lucide-react";
import type { VerificationResult } from "@/types/api";
import { formatCategoryLabel } from "@/lib/format";
import { hasSyntheticSignal, normalizeVerificationResult } from "@/lib/verification-result";
import { resolveTronScanUrl } from "@/lib/tronscan";
import { VerdictBadge } from "./verdict-badge";
import { TronScanLink } from "./tron-scan-link";

export function ResultSummary({
  result,
  layout = "grid",
}: {
  result: VerificationResult;
  layout?: "grid" | "row";
}) {
  const data = normalizeVerificationResult(result);
  const paths = data.paths ?? [];
  const syntheticCount = data.synthetic_count ?? 0;
  const isSynthetic = hasSyntheticSignal(data);
  const verifyUrl = resolveTronScanUrl(
    data.txid ?? data.signature?.txid,
    data.verify_url ?? data.signature?.verify_url,
  );
  const className = layout === "grid" ? "result-board-summary" : "result-summary-top";

  return (
    <div className={className}>
      <div>
        <p className="settings-aside-title">Verdict</p>
        <VerdictBadge verdict={data.verdict} />
      </div>
      <div>
        <p className="settings-aside-title">Risk score</p>
        <p className="balance-metric-value">
          {data.risk_score ?? "n/a"}
          <span className="result-score-max"> / 100</span>
        </p>
      </div>
      <div>
        <p className="settings-aside-title">Status</p>
        <p className="text-sm">{data.status ?? "n/a"}</p>
      </div>
      {data.criteria?.category && (
        <div>
          <p className="settings-aside-title">Category</p>
          <span className="criteria-chip criteria-chip--category">
            {formatCategoryLabel(data.criteria.category)}
          </span>
        </div>
      )}
      {data.criteria?.name && (
        <div>
          <p className="settings-aside-title">Criteria</p>
          <p className="text-sm">{data.criteria.name}</p>
        </div>
      )}
      <div>
        <p className="settings-aside-title">Documents</p>
        <p className="text-sm">{paths.length || "n/a"}</p>
      </div>
      <div>
        <p className="settings-aside-title">On-chain</p>
        <div className="text-sm flex flex-wrap items-center gap-2">
          {data.tron_signed ? (
            <>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                Signed
              </span>
              {verifyUrl && <TronScanLink url={verifyUrl} label="View" compact />}
            </>
          ) : (
            "Not signed"
          )}
        </div>
      </div>
      {isSynthetic && (
        <div>
          <p className="settings-aside-title">Synthetic</p>
          <p className="text-sm">
            {syntheticCount > 0 && paths.length > 1
              ? `${syntheticCount} of ${paths.length}`
              : "Detected"}
          </p>
        </div>
      )}
    </div>
  );
}
