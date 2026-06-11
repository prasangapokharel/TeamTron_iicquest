"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { companyApi, balanceApi } from "@/lib/api";
import type { Company } from "@/types/api";
import { API_ORIGIN } from "@/lib/config";

export function SidebarProfile() {
  const [company, setCompany] = useState<Company | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    companyApi.me().then(setCompany).catch(() => {});
    balanceApi.get().then((b) => setBalance(b.balance)).catch(() => {});
  }, []);

  if (!company) return null;

  const logoSrc = company.logo?.startsWith("/") ? `${API_ORIGIN}${company.logo}` : null;
  const initial = company.company_name.charAt(0).toUpperCase();

  return (
    <Link href="/settings/profile" className="sidebar-profile">
      <div className="sidebar-profile-avatar">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" />
        ) : (
          initial
        )}
      </div>
      <div className="sidebar-profile-text">
        <span className="sidebar-profile-name">{company.company_name}</span>
        <span className="sidebar-profile-meta">
          {balance !== null ? `${balance} credits` : company.email}
        </span>
      </div>
    </Link>
  );
}
