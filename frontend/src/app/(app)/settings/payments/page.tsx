"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { paymentApi, planApi } from "@/lib/api";
import type { Payment, Plan } from "@/types/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planId, setPlanId] = useState("");
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => {
    paymentApi.list().then(setPayments);
    planApi.list().then((p) => {
      setPlans(p);
      if (p[0]) setPlanId(p[0].id);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!planId) return;
    setLoading(true);
    setError("");
    setMsg("");
    try {
      await paymentApi.create(planId, amount);
      setMsg("Payment recorded successfully.");
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Payments"
        description="Billing history and plan purchases for your organization"
        actions={<span className="docs-count-pill">{payments.length} records</span>}
      />

      {(error || msg) && (
        <div className="settings-alerts">
          {error && <p className="auth-error">{error}</p>}
          {msg && <p className="success-banner">{msg}</p>}
        </div>
      )}

      <section className="dash-board balance-board" aria-label="Payments">
        <div className="balance-board-metrics">
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{payments.length}</p>
              <p className="balance-metric-label">Transactions</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">Rs {totalSpent}</p>
              <p className="balance-metric-label">Total recorded</p>
            </div>
          </div>
          <div className="balance-metric">
            <div>
              <p className="balance-metric-value">{plans.length}</p>
              <p className="balance-metric-label">Plans available</p>
            </div>
          </div>
        </div>

        <div className="balance-board-body">
          <div className="settings-board-main">
            <h2 className="settings-section-title">Record payment</h2>
            <p className="settings-section-desc">Log a plan purchase for billing tracking.</p>

            <div className="settings-fields">
              <div className="auth-field">
                <label className="auth-label" htmlFor="plan">Plan</label>
                <select
                  id="plan"
                  className="input-dark"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      Rs {p.per_user}/user
                    </option>
                  ))}
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-label" htmlFor="amount">Amount (Rs)</label>
                <input
                  id="amount"
                  type="number"
                  className="input-dark"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="dash-btn dash-btn--primary"
                onClick={create}
                disabled={loading}
              >
                {loading ? "Saving…" : "Create payment"}
              </button>
            </div>
          </div>

          <aside className="settings-board-aside">
            <div className="settings-aside-block">
              <h2 className="settings-aside-title">Billing notes</h2>
              <ul className="balance-info-list">
                <li>Payments are recorded for audit and reporting.</li>
                <li>Credits are managed separately on the Balance page.</li>
                <li>Demo accounts can log test transactions.</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="documents-table-section documents-table-section--bordered">
          <div className="dash-cell-head">
            <div>
              <h2 className="dash-cell-title">Payment history</h2>
              <p className="dash-cell-desc">All recorded transactions</p>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="dash-board-empty">
              <p>No payments recorded yet.</p>
            </div>
          ) : (
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
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td><code className="settings-id">{p.transaction_id}</code></td>
                      <td className="dash-table-num">{p.amount}</td>
                      <td>{p.date}</td>
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
