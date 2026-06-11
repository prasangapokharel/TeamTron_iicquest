"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { paymentApi, paymentMethodApi, transactionApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import { creditsFromRs, DEFAULT_CREDIT_PRICE_RS, fetchPlanPricing } from "@/lib/pricing";
import { formatPaymentMethod } from "@/lib/esewa";
import type { Payment, PaymentMethod, WalletTransaction } from "@/types/api";

type StatusFilter = "all" | "success" | "pending" | "failed";

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

function CopyTxButton({ txid }: { txid: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(txid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button type="button" className="payments-copy-btn" onClick={copy} aria-label="Copy transaction ID">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [planPayments, setPlanPayments] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState("");
  const [creditPriceRs, setCreditPriceRs] = useState(DEFAULT_CREDIT_PRICE_RS);

  useEffect(() => {
    Promise.all([
      transactionApi.list(),
      paymentApi.list(),
      paymentMethodApi.list().catch(() => [] as PaymentMethod[]),
      fetchPlanPricing(),
    ])
      .then(([txns, plans, pm, pricing]) => {
        setTransactions(txns);
        setPlanPayments(plans);
        setMethods(pm);
        setCreditPriceRs(pricing.creditPriceRs);
      })
      .catch((e: unknown) => {
        setError(formatApiError(e));
      });
  }, []);

  const methodName = (id: number) => {
    const m = methods.find((x) => x.id === id);
    return m ? formatPaymentMethod(m.name) : "eSewa";
  };

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.status.toLowerCase() === filter);
  }, [transactions, filter]);

  const successful = transactions.filter((t) => t.status === "success");
  const totalCredits = successful.reduce(
    (sum, t) => sum + creditsFromRs(t.amount, creditPriceRs),
    0,
  );

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "success", label: "Success" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
  ];

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
              <p className="balance-metric-value">{totalCredits}</p>
              <p className="balance-metric-label">Credits purchased</p>
            </div>
          </div>
        </div>

        <div className="documents-table-section documents-table-section--bordered">
          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">eSewa transactions</h2>
              <p className="dash-cell-desc">GET /transaction — top-ups from the Balance page</p>
            </div>
            <Link href="/settings/balance" className="dash-text-link">
              Top up <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="payments-filters">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`payments-filter${filter === f.id ? " payments-filter--active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="dash-board-empty">
              <p>{filter === "all" ? "No eSewa payments yet." : `No ${filter} transactions.`}</p>
              <Link href="/settings/balance" className="dash-text-link">
                Add credits <ArrowUpRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="dash-data-table data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td>{formatDate(t.created_at)}</td>
                      <td className="dash-table-num">
                        +{creditsFromRs(t.amount, creditPriceRs)} credits
                        <span className="payments-rs-note"> (Rs {t.amount})</span>
                      </td>
                      <td>{methodName(t.payment_method_id)}</td>
                      <td>
                        <span className="payments-txid">
                          <code className="settings-id">{t.txid.slice(0, 12)}…</code>
                          <CopyTxButton txid={t.txid} />
                        </span>
                      </td>
                      <td>
                        <span className={statusBadge(t.status)}>{t.status}</span>
                      </td>
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
                <p className="dash-cell-desc">GET /payment — legacy plan billing entries</p>
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
