"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { VerifyPanel } from "@/components/documents/verify-panel";
import { ResultPanel } from "@/components/verify/result-panel";
import { documentApi } from "@/lib/api";
import type { DocumentListItem, VerificationResult } from "@/types/api";
import { VerdictBadge } from "@/components/verify/verdict-badge";

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    documentApi
      .list()
      .then(setDocs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onVerified = (res: VerificationResult) => {
    setResult(res);
    load();
  };

  const resultId = result?.document_enroll_id ?? result?.enroll_id;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Documents"
        description="Upload, verify, and review all document checks in one place"
        actions={<span className="docs-count-pill">{docs.length} total</span>}
      />

      {error && <div className="settings-alerts"><p className="auth-error">{error}</p></div>}

      <section className="dash-board documents-board" aria-label="Documents workspace">
        <div className="documents-workspace">
          <div className="documents-workspace-form">
            <VerifyPanel onVerified={onVerified} />
          </div>

          <div className="documents-workspace-result">
            {result ? (
              <div className="documents-result-wrap">
                <div className="documents-result-head">
                  <h2 className="settings-section-title">Latest result</h2>
                  {resultId && (
                    <Link href={`/documents/${resultId}/result`} className="dash-text-link">
                      Full report <ArrowUpRight size={13} />
                    </Link>
                  )}
                </div>
                <ResultPanel result={result} />
                {resultId && (
                  <button
                    type="button"
                    className="dash-btn dash-btn--ghost documents-result-btn"
                    onClick={() => router.push(`/documents/${resultId}/result`)}
                  >
                    Open full result
                  </button>
                )}
              </div>
            ) : (
              <div className="documents-result-empty">
                <p className="settings-section-title">Verification output</p>
                <p className="settings-section-desc">
                  Run a check to see verdict, risk score, extracted fields, and blockchain proof here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="documents-table-section">
          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">All verifications</h2>
              <p className="dash-cell-desc">History of every document run on your account</p>
            </div>
          </div>

          {loading ? (
            <div className="dash-loading-inline"><div className="dash-spinner" /></div>
          ) : docs.length === 0 ? (
            <div className="dash-board-empty">
              <p>No documents yet. Use the form above to run your first verification.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th>Status</th>
                    <th>Verdict</th>
                    <th>Score</th>
                    <th>Files</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.enroll_id}>
                      <td>
                        <Link href={`/documents/${d.enroll_id}/result`} className="dash-table-link">
                          <span>{d.criteria_name ?? "Document"}</span>
                          <code>{d.enroll_id.slice(0, 8)}</code>
                        </Link>
                      </td>
                      <td><span className="badge badge-ignored">{d.status}</span></td>
                      <td><VerdictBadge verdict={d.verdict} /></td>
                      <td className="dash-table-num">{d.risk_score ?? "n/a"}</td>
                      <td className="dash-table-num">{d.paths?.length ?? 0}</td>
                      <td className="dash-table-action">
                        <Link href={`/documents/${d.enroll_id}/result`} aria-label="View">
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
