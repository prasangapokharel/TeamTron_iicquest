"use client";

import { cn } from "@/lib/utils";
import type { SpoofingVerifyResponse } from "@/types/api";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function verdictClass(verdict: string) {
  if (verdict === "IDENTICAL") return "status-verified";
  if (verdict === "SIMILAR") return "status-warning";
  return "status-critical";
}

function verdictLabel(verdict: string) {
  if (verdict === "IDENTICAL") return "Same document";
  if (verdict === "SIMILAR") return "Visually similar — review";
  return "Different document";
}

export function SpoofingResult({ data }: { data: SpoofingVerifyResponse }) {
  const { image_a: a, image_b: b, comparison, spoofing_detected, message } = data;
  const verdict = comparison.verdict;

  return (
    <section className="card spoof-result" aria-live="polite">
      <div className="spoof-result-head">
        <div className="spoof-result-verdict">
          <span className="settings-aside-title">Verdict</span>
          <span className={cn("badge", verdictClass(verdict))}>{verdict}</span>
          <span className="text-sm text-[var(--text-muted)]">{verdictLabel(verdict)}</span>
        </div>
        {comparison.similarity_percent != null && (
          <div>
            <span className="settings-aside-title">Similarity</span>
            <p className="balance-metric-value text-lg">{comparison.similarity_percent}%</p>
          </div>
        )}
      </div>

      {spoofing_detected && (
        <div className="spoof-alert spoof-alert--danger" role="alert">
          <strong>Spoofing detected</strong>
          <p>{message}</p>
        </div>
      )}

      {!spoofing_detected && (
        <p className={cn("spoof-alert", verdict === "IDENTICAL" ? "spoof-alert--success" : "spoof-alert--info")}>
          {message}
        </p>
      )}

      <div className="spoof-compare-grid">
        <h4 className="result-section-title">Image comparison</h4>
        <table className="spoof-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Image A (reference)</th>
              <th>Image B (presented)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Filename</td>
              <td>{a.filename}</td>
              <td>{b.filename}</td>
            </tr>
            <tr>
              <td>Dimensions</td>
              <td>{a.dimensions}</td>
              <td>{b.dimensions}</td>
            </tr>
            <tr>
              <td>File size</td>
              <td>{formatSize(a.file_size)}</td>
              <td>{formatSize(b.file_size)}</td>
            </tr>
            <tr>
              <td>VivadX verified</td>
              <td>{a.is_verified ? "Yes" : "No"}</td>
              <td>—</td>
            </tr>
            {a.verified_at && (
              <tr>
                <td>Verified at</td>
                <td>{new Date(a.verified_at).toLocaleString()}</td>
                <td>—</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="spoof-metrics">
        <div>
          <span className="settings-aside-title">Exact match</span>
          <p className="text-sm">{comparison.exact_match ? "Yes — same file bytes" : "No"}</p>
        </div>
        {comparison.phash_distance != null && (
          <div>
            <span className="settings-aside-title">Visual distance</span>
            <p className="text-sm">
              {comparison.phash_distance} / 64
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
