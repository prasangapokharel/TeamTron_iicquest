"use client";

import type { VerificationResult } from "@/types/api";

export function ResultMeta({ result }: { result: VerificationResult }) {
  const hasCredits =
    result.cost_deducted !== undefined || result.balance_remaining !== undefined;

  if (!hasCredits && !result.tron_error) return null;

  return (
    <div className="result-meta-bar">
      {hasCredits && (
        <p className="result-credits-note">
          {result.cost_deducted !== undefined &&
            `${result.cost_deducted} credit${result.cost_deducted === 1 ? "" : "s"} used`}
          {result.cost_deducted !== undefined && result.balance_remaining !== undefined && " · "}
          {result.balance_remaining !== undefined && `${result.balance_remaining} credits left`}
        </p>
      )}
      {result.tron_error && <p className="auth-error">Blockchain: {result.tron_error}</p>}
    </div>
  );
}
