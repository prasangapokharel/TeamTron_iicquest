"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { paymentApi, transactionApi } from "@/lib/api";
import type { Payment, WalletTransaction } from "@/types/api";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "success") return "badge status-verified";
  if (s === "pending") return "badge badge-pending";
  if (s === "failed") return "badge status-critical";
  return "badge badge-ignored";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [planPayments, setPlanPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([transactionApi.list(), paymentApi.list()])
      .then(([txns, plans]) => {
        setTransactions(txns);
        setPlanPayments(plans);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Could not load payments");
      });
  }, []);

  const successful = transactions.filter((t) => t.status === "success");
  const totalPaid = successful.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Payments"
        description="eSewa top-ups and billing records for your workspace"
        actions={
          <Link href="/settings/balance" className="dash-btn dash-btn--primary">
            Add credits
          </Link>
        }
      />

      {error && (
        <div className="settings-alerts">
          <p className="auth-error">{error}</p>
        </div>
      )}

      <section className="dash-board balance-board" aria-label="Payments">
        <div className="balance-board-metrics">
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{transactions.length}</p>
              <p className="balance-metric-label">eSewa attempts</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{successful.length}</p>
              <p className="balance-metric-label">Successful</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">Rs {totalPaid}</p>
              <p className="balance-metric-label">Credits purchased</p>
            </div>
          </div>
        </div>

        <div className="documents-table-section documents-table-section--bordered">
          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">eSewa transactions</h2>
              <p className="dash-cell-desc">Top-ups from the Balance page</p>
            </div>
            <Link href="/settings/balance" className="dash-text-link">
              Top up <ArrowUpRight size={13} />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="dash-board-empty">
              <p>No eSewa payments yet.</p>
              <Link href="/settings/balance" className="dash-text-link">
                Add credits <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Amount (Rs)</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <code className="settings-id">{t.txid.slice(0, 12)}…</code>
                      </td>
                      <td className="dash-table-num">{t.amount}</td>
                      <td>
                        <span className={statusBadge(t.status)}>{t.status}</span>
                      </td>
                      <td>{formatDate(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {planPayments.length > 0 && (
          <div className="documents-table-section documents-table-section--bordered">
            <div className="dash-cell-head">
              <div>
                <h2 className="dash-cell-title">Plan records</h2>
                <p className="dash-cell-desc">Internal billing entries (legacy)</p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Amount (Rs)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {planPayments.map((p) => (
                    <tr key={p.id}>
                      <td><code className="settings-id">{p.transaction_id}</code></td>
                      <td className="dash-table-num">{p.amount}</td>
                      <td>{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
