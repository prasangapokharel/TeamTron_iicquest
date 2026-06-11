"use client";

import { UploadedDocumentsGallery } from "@/components/documents/uploaded-documents-gallery";
import type { VerificationResult } from "@/types/api";
import { normalizeVerificationResult } from "@/lib/verification-result";
import { resolveTronScanUrl } from "@/lib/tronscan";
import { VerdictBadge, SeverityDot } from "./verdict-badge";
import { ResultSummary } from "./result-summary";
import { PerDocumentResults } from "./per-document-results";
import { ResultMeta } from "./result-meta";
import { TronScanLink } from "./tron-scan-link";

export function ResultPanel({
  result,
  hideSummary = false,
  galleryVariant = "compact",
}: {
  result: VerificationResult;
  hideSummary?: boolean;
  galleryVariant?: "compact" | "large";
}) {
  const data = normalizeVerificationResult(result);
  const sig = data.signature;
  const txid = sig?.txid ?? data.txid;
  const verifyUrl = resolveTronScanUrl(txid, data.verify_url ?? sig?.verify_url);
  const enrollId = data.document_enroll_id ?? data.enroll_id;
  const paths = data.paths ?? [];
  const multiDoc = paths.length > 1;
  const hasPerDoc = (data.documents?.length ?? 0) > 0;

  return (
    <div className="result-panel">
      {!hideSummary && (
        <div className="result-summary card">
          <ResultSummary result={data} layout="row" />
          {verifyUrl && (
            <TronScanLink
              url={verifyUrl}
              label={data.tron_signed ? "View on Nile TronScan" : "View"}
            />
          )}
          <ResultMeta result={data} />
        </div>
      )}

      {hideSummary && (
        <>
          {verifyUrl && (
            <TronScanLink
              url={verifyUrl}
              label={data.tron_signed ? "View on Nile TronScan" : "View"}
            />
          )}
          <ResultMeta result={data} />
        </>
      )}

      {data.flags && data.flags.length > 0 && !hideSummary && (
        <section className="card result-section">
          <h3 className="result-section-title">
            {multiDoc ? "Overall flags" : "Flags"}
          </h3>
          <div className="result-flags">
            {data.flags.map((f, i) => (
              <div key={i} className="result-flag-row">
                <SeverityDot severity={f.severity} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{f.field}</p>
                  {f.issue && <p className="text-xs text-[var(--text-muted)]">{f.issue}</p>}
                  {f.value && !f.issue && (
                    <p className="text-xs text-[var(--text-muted)]">{f.value}</p>
                  )}
                </div>
                <VerdictBadge verdict={f.severity} />
              </div>
            ))}
          </div>
        </section>
      )}

      {data.suggestions && data.suggestions.length > 0 && !hideSummary && (
        <section className="card result-section">
          <h3 className="result-section-title">Suggestions</h3>
          <ul className="result-suggestions">
            {data.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {enrollId && paths.length > 0 && (
        <UploadedDocumentsGallery enrollId={enrollId} paths={paths} variant={galleryVariant} />
      )}

      {hasPerDoc && data.documents && (
        <PerDocumentResults documents={data.documents} />
      )}

      {data.extracted_fields && Object.keys(data.extracted_fields).length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">
            {multiDoc ? "Overall extracted fields (merged)" : "Extracted fields"}
          </h3>
          <div className="result-fields">
            {Object.entries(data.extracted_fields).map(([k, v]) => (
              <div key={k} className="result-field-row">
                <span className="result-field-key">{k}</span>
                <span className="result-field-val">{v ?? "n/a"}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.conflicts && Object.keys(data.conflicts).length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">Conflicts across documents</h3>
          {Object.entries(data.conflicts).map(([field, values]) => (
            <div key={field} className="auth-error mb-2">
              <strong>{field}:</strong> {values.join(" ≠ ")}
            </div>
          ))}
        </section>
      )}

      {(sig || data.hash) && (
        <section className="card result-section">
          <h3 className="result-section-title">Blockchain proof</h3>
          <div className="result-mono-block">
            {data.hash && <p><span>Hash</span>{data.hash}</p>}
            {txid && (
              <p className="result-mono-row">
                <span className="result-mono-row-label">TXID</span>
                <span className="result-mono-row-body">
                  <code>{txid}</code>
                  {verifyUrl && <TronScanLink url={verifyUrl} label="View" compact />}
                </span>
              </p>
            )}
            {(sig?.to_address || data.to_address) && (
              <p><span>To Address</span>{sig?.to_address ?? data.to_address}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
