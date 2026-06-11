"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { balanceApi } from "@/lib/api";
import { DEFAULT_VERIFY_COST_CREDITS, fetchPlanPricing } from "@/lib/pricing";

export function LowBalanceBanner() {
  const [balance, setBalance] = useState<number | null>(null);
  const [verifyCost, setVerifyCost] = useState(DEFAULT_VERIFY_COST_CREDITS);

  useEffect(() => {
    fetchPlanPricing().then(({ verifyCostCredits }) => setVerifyCost(verifyCostCredits));
    balanceApi
      .get()
      .then((b) => setBalance(b.balance))
      .catch(() => setBalance(null));
  }, []);

  const lowThreshold = verifyCost * 2;
  if (balance === null || balance >= lowThreshold) return null;

  return (
    <div className="low-balance-banner" role="status">
      <p>
        Low balance: <strong>{balance}</strong> credit{balance === 1 ? "" : "s"} left.{" "}
        <Link href="/settings/balance">Top up</Link> to keep verifying documents.
      </p>
    </div>
  );
}
