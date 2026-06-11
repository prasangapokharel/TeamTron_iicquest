"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CreditCard, FileCheck, Loader2, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { balanceApi, paymentApi, paymentMethodApi } from "@/lib/api";
import { formatPaymentMethod, redirectToEsewa } from "@/lib/esewa";
import type { PaymentMethod } from "@/types/api";

const PRESETS = [50, 100, 250, 500];

export default function BalancePage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState(100);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const hasEsewa = methods.some((m) => m.name.toLowerCase() === "esewa");

  const load = () => balanceApi.get().then((b) => setBalance(b.balance));

  useEffect(() => {
    load();
    paymentMethodApi.list().then(setMethods).catch(() => setMethods([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (!payment) return;

    if (payment === "success") {
      const paid = params.get("amount");
      const newBal = params.get("balance");
      setMsg(
        paid && newBal
          ? `Payment done. Rs ${paid} added. Your balance is now ${newBal} credits.`
          : "Payment successful. Credits added to your account.",
      );
      load();
    } else if (payment === "failed") {
      const reason = params.get("reason") ?? "";
      const friendly: Record<string, string> = {
        cancelled: "Payment was cancelled on eSewa.",
        "Payment not completed": "eSewa did not mark the payment as complete.",
        verification_error: "We could not confirm the payment. If credits did not update, open Payment history or contact support.",
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
  }, []);

  const payWithEsewa = async () => {
    if (amount < 1) {
      setError("Enter at least Rs 1.");
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const init = await paymentApi.initializeEsewa(amount);
      redirectToEsewa(init);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not start eSewa payment");
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
              <p className="balance-metric-value">Rs 1</p>
              <p className="balance-metric-label">Per credit</p>
            </div>
          </div>
        </div>

        <div className="balance-board-body">
          <div className="settings-board-main">
            <h2 className="settings-section-title">Add credits</h2>
            <p className="settings-section-desc">
              Rs 1 buys 1 credit. Pay with eSewa and credits land in your account after checkout.
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
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
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
                <li>Each document verification uses 1 credit.</li>
                <li>Rs 1 = 1 credit on eSewa top-up.</li>
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
          </aside>
        </div>
      </section>
    </div>
  );
}
