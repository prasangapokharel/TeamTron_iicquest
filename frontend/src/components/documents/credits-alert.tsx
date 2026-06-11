import Link from "next/link";
import { ArrowUpRight, Wallet, Zap } from "lucide-react";

export function CreditsAlert({
  balance,
  blocked,
}: {
  balance: number;
  blocked?: boolean;
}) {
  return (
    <div className="credits-alert" role="alert">
      <div className="credits-alert-head">
        <Wallet size={16} className="credits-alert-icon" aria-hidden />
        <div>
          <p className="credits-alert-title">
            {blocked ? "Not enough credits to run this check" : "You are out of credits"}
          </p>
          <p className="credits-alert-desc">
            Each verification uses 1 credit. You have{" "}
            <strong>{balance}</strong> left. Top up with eSewa on the Balance page, then come
            back here to verify.
          </p>
        </div>
      </div>
      <Link href="/settings/balance" className="dash-btn dash-btn--primary credits-alert-cta">
        Add credits
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}

export function CreditsStatus({
  balance,
  loading,
}: {
  balance: number | null;
  loading?: boolean;
}) {
  if (loading || balance === null) return null;

  if (balance < 1) return null;

  const low = balance <= 3;

  return (
    <p className={`credits-status${low ? " credits-status--low" : ""}`}>
      <Zap size={13} aria-hidden />
      <span>
        <strong>{balance}</strong> credit{balance === 1 ? "" : "s"} available
        {low ? " · running low" : ""}
      </span>
    </p>
  );
}
