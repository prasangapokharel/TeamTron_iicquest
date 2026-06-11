"use client";

import { useEffect, useState } from "react";
import { balanceApi, companyApi } from "@/lib/api";
import type { Company } from "@/types/api";

export function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    companyApi.me().then(setCompany).catch(() => {});
    balanceApi.get().then((b) => setBalance(b.balance)).catch(() => {});
  }, []);

  return (
    <header className="dash-header">
      <div>
        <h1 className="dash-title">{title}</h1>
        {subtitle && <p className="dash-subtitle">{subtitle}</p>}
      </div>
      <div className="dash-header-meta">
        {balance !== null && (
          <span className="dash-balance-pill">
            {balance} credits
          </span>
        )}
        {company && (
          <span className="dash-company-pill">{company.company_name}</span>
        )}
      </div>
    </header>
  );
}
