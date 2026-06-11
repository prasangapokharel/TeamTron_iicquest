"use client";

import type { DocumentResult } from "@/types/api";
import { VerdictBadge, SeverityDot } from "./verdict-badge";
import { fileNameFromPath } from "@/lib/document-files";

export function PerDocumentResults({ documents }: { documents: DocumentResult[] }) {
  if (!documents.length) return null;

  return (
    <section className="card result-section">
      <h3 className="result-section-title">Per-document results</h3>
      <p className="settings-section-desc uploaded-doc-desc">
        Individual verdict for each of {documents.length} uploaded image
        {documents.length === 1 ? "" : "s"}
      </p>
      <div className="per-doc-results">
        {documents.map((doc) => (
          <article key={doc.index} id={`doc-result-${doc.index}`} className="per-doc-card">
            <div className="per-doc-card-head">
              <div>
                <p className="per-doc-card-title">Document {doc.index + 1}</p>
                <p className="per-doc-card-file" title={doc.path}>
                  {fileNameFromPath(doc.path)}
                </p>
              </div>
              <VerdictBadge verdict={doc.verdict} />
            </div>

            <div className="per-doc-card-meta">
              <span>Risk {doc.risk_score ?? 0}/100</span>
              {doc.is_synthetic && <span className="per-doc-synthetic-tag">Synthetic</span>}
            </div>

            {doc.suggestions && doc.suggestions.length > 0 && (
              <p className="per-doc-suggestion">{doc.suggestions.join(" ")}</p>
            )}

            {doc.error && <p className="auth-error">{doc.error}</p>}

            {doc.flags && doc.flags.length > 0 && (
              <div className="per-doc-flags">
                {doc.flags.map((f, i) => (
                  <div key={i} className="per-doc-flag-row">
                    <SeverityDot severity={f.severity} />
                    <span className="text-xs text-[var(--text-muted)]">
                      {f.issue ?? f.field}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {doc.extracted_fields && Object.keys(doc.extracted_fields).length > 0 && (
              <div className="per-doc-fields">
                {Object.entries(doc.extracted_fields).map(([k, v]) => (
                  <div key={k} className="per-doc-field-row">
                    <span>{k}</span>
                    <span>{v ?? "n/a"}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
