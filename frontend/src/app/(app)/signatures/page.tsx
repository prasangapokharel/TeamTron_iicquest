"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { signatureApi } from "@/lib/api";
import type { SignatureItem } from "@/types/api";

export default function SignaturesPage() {
  const [sigs, setSigs] = useState<SignatureItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signatureApi
      .list()
      .then(setSigs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Blockchain"
        description="Tron on-chain proofs for verified documents"
        actions={<span className="docs-count-pill">{sigs.length} signatures</span>}
      />

      {error && (
        <div className="settings-alerts">
          <p className="auth-error">{error}</p>
        </div>
      )}

      <section className="dash-board" aria-label="Blockchain signatures">
        <div className="documents-table-section">
          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">On-chain records</h2>
              <p className="dash-cell-desc">
                Green verifications are signed automatically on Tron Nile testnet
              </p>
            </div>
          </div>

          {loading ? (
            <div className="dash-loading-inline"><div className="dash-spinner" /></div>
          ) : sigs.length === 0 ? (
            <div className="dash-board-empty">
              <p>No signatures yet.</p>
              <Link href="/documents" className="dash-text-link">
                Run a verification <ExternalLink size={13} />
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>TXID</th>
                    <th>Address</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {sigs.map((s) => (
                    <tr key={s.signature_id}>
                      <td>
                        <Link href={`/documents/${s.document_enroll_id}/result`} className="dash-table-link">
                          <span>Enrollment</span>
                          <code>{s.document_enroll_id.slice(0, 8)}</code>
                        </Link>
                      </td>
                      <td><span className="badge badge-ignored">{s.document_status}</span></td>
                      <td><code className="settings-id">{s.txid.slice(0, 14)}…</code></td>
                      <td><code className="settings-id">{s.to_address.slice(0, 10)}…</code></td>
                      <td className="dash-table-action">
                        <a href={s.verify_url} target="_blank" rel="noopener noreferrer" aria-label="TronScan">
                          <Link2 size={14} />
                        </a>
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
