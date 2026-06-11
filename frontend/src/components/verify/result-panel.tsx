"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import type { VerificationResult } from "@/types/api";
import { VerdictBadge, SeverityDot } from "./verdict-badge";

export function ResultPanel({ result }: { result: VerificationResult }) {
  const sig = result.signature;
  const verifyUrl = result.verify_url ?? sig?.verify_url;

  return (
    <div className="result-panel">
      <div className="result-summary card">
        <div className="result-summary-top">
          <div>
            <p className="section-label">Verdict</p>
            <VerdictBadge verdict={result.verdict} />
          </div>
          <div className="result-score">
            <p className="section-label">Risk Score</p>
            <span className="result-score-value">{result.risk_score ?? "—"}</span>
            <span className="result-score-max">/ 100</span>
          </div>
          {result.criteria && (
            <div>
              <p className="section-label">Criteria</p>
              <p className="text-sm text-[var(--text-secondary)]">{result.criteria.name}</p>
            </div>
          )}
        </div>

        {verifyUrl && (
          <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="tron-link">
            <ShieldCheck size={16} />
            View on TronScan
            <ExternalLink size={14} />
          </a>
        )}
        {result.tron_error && (
          <p className="auth-error mt-3">Blockchain: {result.tron_error}</p>
        )}
      </div>

      {result.extracted_fields && Object.keys(result.extracted_fields).length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">Extracted Fields</h3>
          <div className="result-fields">
            {Object.entries(result.extracted_fields).map(([k, v]) => (
              <div key={k} className="result-field-row">
                <span className="result-field-key">{k}</span>
                <span className="result-field-val">{v ?? "—"}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.conflicts && Object.keys(result.conflicts).length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">Conflicts</h3>
          {Object.entries(result.conflicts).map(([field, values]) => (
            <div key={field} className="auth-error mb-2">
              <strong>{field}:</strong> {values.join(" ≠ ")}
            </div>
          ))}
        </section>
      )}

      {result.flags && result.flags.length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">Flags</h3>
          <div className="result-flags">
            {result.flags.map((f, i) => (
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

      {result.suggestions && result.suggestions.length > 0 && (
        <section className="card result-section">
          <h3 className="result-section-title">Suggestions</h3>
          <ul className="result-suggestions">
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      {(sig || result.hash) && (
        <section className="card result-section">
          <h3 className="result-section-title">Blockchain Proof</h3>
          <div className="result-mono-block">
            {result.hash && <p><span>Hash</span>{result.hash}</p>}
            {(sig?.txid || result.txid) && (
              <p><span>TXID</span>{sig?.txid ?? result.txid}</p>
            )}
            {(sig?.to_address || result.to_address) && (
              <p><span>To Address</span>{sig?.to_address ?? result.to_address}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
