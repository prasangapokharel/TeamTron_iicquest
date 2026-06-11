"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { documentApi } from "@/lib/api";
import type { VerificationResult } from "@/types/api";
import { ResultPanel } from "@/components/verify/result-panel";
import { VerdictBadge } from "@/components/verify/verdict-badge";

export default function DocumentResultPage() {
  const { enrollId } = useParams<{ enrollId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (enrollId) {
      documentApi
        .result(enrollId)
        .then(setResult)
        .catch((e) => setError(e.message));
    }
  }, [enrollId]);

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Verification result"
        description={
          enrollId
            ? `Run ${enrollId.slice(0, 8)}: extracted fields, flags, and blockchain proof`
            : "Document verification report"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/documents" className="dash-btn dash-btn--ghost">
              <ArrowLeft size={14} />
              Documents
            </Link>
            {enrollId && (
              <Link href={`/assistant?enroll=${enrollId}`} className="dash-btn dash-btn--primary">
                <MessageSquare size={14} />
                Ask assistant
              </Link>
            )}
          </div>
        }
      />

      {error && (
        <div className="settings-alerts">
          <p className="auth-error">{error}</p>
        </div>
      )}

      {!result && !error && (
        <div className="dash-loading-inline"><div className="dash-spinner" /></div>
      )}

      {result && (
        <section className="dash-board result-board" aria-label="Verification result">
          <div className="result-board-summary">
            <div>
              <p className="settings-aside-title">Verdict</p>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <div>
              <p className="settings-aside-title">Risk score</p>
              <p className="balance-metric-value">{result.risk_score ?? "n/a"}</p>
            </div>
            <div>
              <p className="settings-aside-title">Criteria</p>
              <p className="text-sm">{result.criteria?.name ?? "n/a"}</p>
            </div>
            <div>
              <p className="settings-aside-title">On-chain</p>
              <p className="text-sm">{result.tron_signed ? "Signed" : "Not signed"}</p>
            </div>
          </div>
          <div className="result-board-body">
            <ResultPanel result={result} />
          </div>
        </section>
      )}
    </div>
  );
}
