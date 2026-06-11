"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, FileCheck, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { balanceApi } from "@/lib/api";

const PRESETS = [50, 100, 250, 500];

export default function BalancePage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => balanceApi.get().then((b) => setBalance(b.balance));

  useEffect(() => {
    load();
  }, []);

  const topup = async () => {
    if (amount < 1) {
      setError("Enter at least 1 credit.");
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const b = await balanceApi.topup(amount);
      setBalance(b.balance);
      setMsg(`Added ${amount} credits. New balance: ${b.balance}.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setLoading(false);
    }
  };

  const verificationsLeft = balance;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Balance"
        description="Top up credits. One credit covers one document check."
      />

      {(error || msg) && (
        <div className="settings-alerts">
          {error && <p className="auth-error">{error}</p>}
          {msg && <p className="success-banner">{msg}</p>}
        </div>
      )}

      <section className="dash-board balance-board" aria-label="Balance and top-up">
        <div className="balance-board-metrics">
          <div className="balance-metric">
            <Zap size={15} className="balance-metric-icon" />
            <div>
              <p className="balance-metric-value">{balance}</p>
              <p className="balance-metric-label">Available credits</p>
            </div>
          </div>
          <div className="balance-metric">
            <FileCheck size={15} className="balance-metric-icon" />
            <div>
              <p className="balance-metric-value">{verificationsLeft}</p>
              <p className="balance-metric-label">Verifications left</p>
            </div>
          </div>
          <div className="balance-metric">
            <CreditCard size={15} className="balance-metric-icon" />
            <div>
              <p className="balance-metric-value">1</p>
              <p className="balance-metric-label">Credit per run</p>
            </div>
          </div>
        </div>

        <div className="balance-board-body">
          <div className="settings-board-main">
            <h2 className="settings-section-title">Top up credits</h2>
            <p className="settings-section-desc">
              Add credits for demo runs or production verifications. Top-ups apply instantly.
            </p>

            <div className="balance-presets">
              <span className="balance-presets-label">Quick amounts</span>
              <div className="balance-presets-row">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`balance-preset${amount === preset ? " balance-preset--active" : ""}`}
                    onClick={() => setAmount(preset)}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-fields balance-fields">
              <div className="auth-field">
                <label className="auth-label" htmlFor="topup-amount">
                  Custom amount
                </label>
                <input
                  id="topup-amount"
                  type="number"
                  className="input-dark"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="settings-actions">
              <button
                type="button"
                className="dash-btn dash-btn--primary"
                onClick={topup}
                disabled={loading}
              >
                {loading ? "Processing…" : `Add ${amount} credits`}
              </button>
            </div>
          </div>

          <aside className="settings-board-aside">
            <div className="settings-aside-block">
              <h2 className="settings-aside-title">How it works</h2>
              <ul className="balance-info-list">
                <li>Each document verification consumes 1 credit.</li>
                <li>Credits are deducted when a check completes.</li>
                <li>Failed extractions may still use a credit depending on pipeline stage.</li>
                <li>Top-ups are instant for hackathon and demo accounts.</li>
              </ul>
            </div>

            <nav className="settings-aside-links" aria-label="Related billing">
              <Link href="/settings/payments" className="settings-aside-link">
                <CreditCard size={14} />
                Payment history
                <ArrowUpRight size={13} />
              </Link>
              <Link href="/documents" className="settings-aside-link">
                Run a verification
                <ArrowUpRight size={13} />
              </Link>
            </nav>
          </aside>
        </div>
      </section>
    </div>
  );
}
