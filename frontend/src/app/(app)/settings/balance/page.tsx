"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, FileCheck, Loader2, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { balanceApi, paymentApi, paymentMethodApi, transactionApi } from "@/lib/api";
import { formatApiError } from "@/lib/errors";
import { formatPaymentMethod, redirectToEsewa } from "@/lib/esewa";
import {
  creditsFromRs,
  DEFAULT_CREDIT_PRICE_RS,
  DEFAULT_VERIFY_COST_CREDITS,
  fetchPlanPricing,
  verificationsFromBalance,
} from "@/lib/pricing";
import type { PaymentMethod, WalletTransaction } from "@/types/api";

const PRESETS = [50, 100, 250, 500, 1000];

export default function BalancePage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(100);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [recentTx, setRecentTx] = useState<WalletTransaction[]>([]);
  const [creditPriceRs, setCreditPriceRs] = useState(DEFAULT_CREDIT_PRICE_RS);
  const [verifyCost, setVerifyCost] = useState(DEFAULT_VERIFY_COST_CREDITS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const hasEsewa = methods.some((m) => m.name.toLowerCase() === "esewa");
  const creditsForAmount = creditsFromRs(amount, creditPriceRs);
  const verificationsLeft = verificationsFromBalance(balance, verifyCost);

  const load = () =>
    Promise.all([
      balanceApi.get().then((b) => setBalance(b.balance)),
      transactionApi.list().then((tx) => setRecentTx(tx.slice(0, 5))).catch(() => setRecentTx([])),
    ]);

  useEffect(() => {
    load();
    paymentMethodApi.list().then(setMethods).catch(() => setMethods([]));
    fetchPlanPricing().then(({ creditPriceRs: price, verifyCostCredits }) => {
      setCreditPriceRs(price);
      setVerifyCost(verifyCostCredits);
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;

    if (payment === "success") {
      const paid = params.get("amount");
      const newBal = params.get("balance");
      const creditsAdded = paid ? creditsFromRs(Number(paid), creditPriceRs) : null;
      setMsg(
        paid && newBal && creditsAdded !== null
          ? `Payment done. Rs ${paid} added ${creditsAdded} credit${creditsAdded === 1 ? "" : "s"}. Your balance is now ${newBal} credits.`
          : "Payment successful. Credits added to your account.",
      );
      load();
    } else if (payment === "failed") {
      const reason = params.get("reason") ?? "";
      const friendly: Record<string, string> = {
        cancelled: "Payment was cancelled on eSewa.",
        "Payment not completed": "eSewa did not mark the payment as complete.",
        verification_error:
          "We could not confirm the payment. If credits did not update, open Payment history or contact support.",
      };
      setError(
        friendly[reason] ??
          (reason.includes("status API")
            ? "Could not reach eSewa to confirm payment. Check your internet and try again."
            : reason
              ? `Payment could not be completed: ${reason}`
              : "Payment failed. Try again or check Payment history."),
      );
    }

    window.history.replaceState({}, "", "/settings/balance");
  }, [creditPriceRs]);

  const payWithEsewa = async () => {
    if (amount < creditPriceRs) {
      setError(`Enter at least Rs ${creditPriceRs}.`);
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const init = await paymentApi.initializeEsewa(amount);
      redirectToEsewa(init);
    } catch (e: unknown) {
      setError(formatApiError(e));
      setLoading(false);
    }
  };

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Balance"
        description={`Top up credits. Each verification uses ${verifyCost} credits.`}
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
              <p className="balance-metric-value">Rs {creditPriceRs}</p>
              <p className="balance-metric-label">Per credit</p>
            </div>
          </div>
        </div>

        <div className="balance-board-body">
          <div className="settings-board-main">
            <h2 className="settings-section-title">Add credits</h2>
            <p className="settings-section-desc">
              Rs {creditPriceRs} buys 1 credit. Pay with eSewa and credits land in your account after checkout.
            </p>

            {methods.length > 0 && (
              <p className="balance-methods">
                Available:{" "}
                {methods.map((m) => formatPaymentMethod(m.name)).join(", ")}
              </p>
            )}

            <div className="balance-presets">
              <span className="balance-presets-label">Quick amounts (Rs)</span>
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
                  Amount (Rs)
                </label>
                <input
                  id="topup-amount"
                  type="number"
                  className="input-dark"
                  min={creditPriceRs}
                  step={creditPriceRs}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              {creditsForAmount > 0 && (
                <p className="balance-credits-preview">
                  You will receive <strong>{creditsForAmount}</strong> credit
                  {creditsForAmount === 1 ? "" : "s"}
                </p>
              )}
            </div>

            <div className="settings-actions">
              {hasEsewa ? (
                <button
                  type="button"
                  className="dash-btn dash-btn--primary"
                  onClick={payWithEsewa}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="auth-spin" aria-hidden />
                      Redirecting to eSewa…
                    </>
                  ) : (
                    `Pay Rs ${amount} with eSewa`
                  )}
                </button>
              ) : (
                <p className="auth-error">
                  eSewa is not set up yet. Run the payment_method seed on the backend.
                </p>
              )}
            </div>
          </div>

          <aside className="settings-board-aside">
            <div className="settings-aside-block">
              <h2 className="settings-aside-title">How it works</h2>
              <ul className="balance-info-list">
                <li>Each document verification uses {verifyCost} credits.</li>
                <li>Rs {creditPriceRs} = 1 credit on eSewa top-up.</li>
                <li>You are sent to eSewa to complete payment.</li>
                <li>Credits update after eSewa confirms the payment.</li>
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

            {recentTx.length > 0 && (
              <div className="settings-aside-block">
                <h2 className="settings-aside-title">Recent top-ups</h2>
                <ul className="balance-recent-list">
                  {recentTx.map((t) => {
                    const credits = creditsFromRs(t.amount, creditPriceRs);
                    return (
                      <li key={t.id}>
                        <span>
                          +{credits} credit{credits === 1 ? "" : "s"} (Rs {t.amount})
                        </span>
                        <span
                          className={`badge ${t.status === "success" ? "status-verified" : "badge-ignored"}`}
                        >
                          {t.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/settings/payments" className="dash-text-link">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
