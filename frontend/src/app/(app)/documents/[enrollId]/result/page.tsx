"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { documentApi } from "@/lib/api";
import { formatApiError, isNotFound } from "@/lib/errors";
import type { DocumentDetail, VerificationResult } from "@/types/api";
import { ResultPanel } from "@/components/verify/result-panel";
import { UploadedDocumentsGallery } from "@/components/documents/uploaded-documents-gallery";
import { VerdictBadge } from "@/components/verify/verdict-badge";
import { formatCategoryLabel } from "@/lib/format";

export default function DocumentResultPage() {
  const { enrollId } = useParams<{ enrollId: string }>();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!enrollId) return;

    documentApi
      .result(enrollId)
      .then(setResult)
      .catch(async (e) => {
        if (isNotFound(e)) {
          try {
            const doc = await documentApi.get(enrollId);
            setDetail(doc);
            setPending(!doc.verdict);
            setError(
              doc.verdict
                ? ""
                : "This document has not been verified yet. Run a check from Documents.",
            );
          } catch (inner) {
            setError(formatApiError(inner));
          }
        } else {
          setError(formatApiError(e));
        }
      });
  }, [enrollId]);

  const display = result ?? (detail as VerificationResult | null);

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
            {enrollId && !pending && (
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
          <p className={pending ? "success-banner" : "auth-error"}>{error}</p>
          {pending && (
            <Link href="/documents" className="dash-text-link">
              Go to Documents to verify
            </Link>
          )}
        </div>
      )}

      {!display && !error && (
        <div className="dash-loading-inline"><div className="dash-spinner" /></div>
      )}

      {display && (
        <section className="dash-board result-board" aria-label="Verification result">
          <div className="result-board-summary">
            <div>
              <p className="settings-aside-title">Verdict</p>
              <VerdictBadge verdict={display.verdict} />
            </div>
            <div>
              <p className="settings-aside-title">Risk score</p>
              <p className="balance-metric-value">{display.risk_score ?? "n/a"}</p>
            </div>
            <div>
              <p className="settings-aside-title">Status</p>
              <p className="text-sm">{display.status ?? "n/a"}</p>
            </div>
            {(result?.criteria?.category ?? detail?.criteria_category) && (
              <div>
                <p className="settings-aside-title">Category</p>
                <span className="criteria-chip criteria-chip--category">
                  {formatCategoryLabel(
                    result?.criteria?.category ?? detail?.criteria_category,
                  )}
                </span>
              </div>
            )}
            {result?.criteria?.name && (
              <div>
                <p className="settings-aside-title">Criteria</p>
                <p className="text-sm">{result.criteria.name}</p>
              </div>
            )}
            <div>
              <p className="settings-aside-title">On-chain</p>
              <p className="text-sm">{display.tron_signed ? "Signed" : "Not signed"}</p>
            </div>
          </div>

          {result && (
            <div className="result-board-body">
              <ResultPanel result={result} />
            </div>
          )}

          {!result && detail && enrollId && detail.paths.length > 0 && (
            <div className="result-board-body">
              <UploadedDocumentsGallery enrollId={enrollId} paths={detail.paths} />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
