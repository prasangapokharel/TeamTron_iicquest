"use client";

import type { VerificationResult } from "@/types/api";
import { normalizeVerificationResult } from "@/lib/verification-result";
import { VerdictBadge, SeverityDot } from "./verdict-badge";

function problemFlags(result: VerificationResult) {
  return (result.flags ?? []).filter(
    (f) => f.issue && f.severity !== "green",
  );
}

export function ResultIssuesSummary({ result }: { result: VerificationResult }) {
  const data = normalizeVerificationResult(result);
  const flags = problemFlags(data);
  const suggestions = data.suggestions ?? [];
  const verdict = (data.verdict ?? "").toLowerCase();

  if (verdict === "green" && flags.length === 0 && suggestions.length === 0) {
    return null;
  }

  const headline =
    verdict === "red"
      ? "Verification failed"
      : verdict === "orange"
        ? "Manual review required"
        : verdict === "green"
          ? "Verified with notes"
          : "Verification summary";

  return (
    <section className={`result-issues-summary result-issues-summary--${verdict || "unknown"}`}>
      <div className="result-issues-summary-head">
        <h3 className="result-issues-summary-title">{headline}</h3>
        {flags.length > 0 && (
          <span className="result-issues-count">
            {flags.length} issue{flags.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {suggestions.length > 0 && (
        <ul className="result-issues-suggestions">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      {flags.length > 0 && (
        <ul className="result-issues-flags">
          {flags.map((f, i) => (
            <li key={i} className="result-issues-flag">
              <SeverityDot severity={f.severity} />
              <div className="min-w-0 flex-1">
                <span className="result-issues-flag-field">{f.field}</span>
                <p className="result-issues-flag-issue">{f.issue}</p>
              </div>
              <VerdictBadge verdict={f.severity} />
            </li>
          ))}
        </ul>
      )}

      {verdict === "red" && !data.tron_signed && (
        <p className="result-issues-footnote">Document was not signed on blockchain.</p>
      )}
    </section>
  );
}
