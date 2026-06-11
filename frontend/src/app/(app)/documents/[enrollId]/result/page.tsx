"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { documentApi } from "@/lib/api";
import { formatApiError, isNotFound } from "@/lib/errors";
import type { DocumentDetail, VerificationResult } from "@/types/api";
import { normalizeVerificationResult } from "@/lib/verification-result";
import { ResultPanel } from "@/components/verify/result-panel";
import { ResultSummary } from "@/components/verify/result-summary";
import { ResultIssuesSummary } from "@/components/verify/result-issues-summary";
import { UploadedDocumentsGallery } from "@/components/documents/uploaded-documents-gallery";

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

  const display = result
    ? normalizeVerificationResult(result)
    : detail
      ? normalizeVerificationResult(detail)
      : null;

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
          <ResultSummary result={display} layout="grid" />

          <ResultIssuesSummary result={display} />

          {result && (
            <div className="result-board-body">
              <ResultPanel result={result} hideSummary galleryVariant="large" />
            </div>
          )}

          {!result && detail && enrollId && detail.paths.length > 0 && (
            <div className="result-board-body">
              <UploadedDocumentsGallery enrollId={enrollId} paths={detail.paths} variant="large" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
