"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, Wallet, Key } from "lucide-react";
import { API_ORIGIN } from "@/lib/config";
import type { Company, DashboardData } from "@/types/api";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function ProfilePanel({
  company,
  balance,
  data,
}: {
  company: Company;
  balance: number;
  data: DashboardData;
}) {
  const logoSrc = company.logo?.startsWith("/")
    ? `${API_ORIGIN}${company.logo}`
    : company.logo;

  return (
    <div className="profile-board">
      <div className="profile-board-head">
        <div className="profile-board-avatar">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={company.company_name}
              width={40}
              height={40}
              className="profile-board-avatar-img"
              unoptimized
            />
          ) : (
            <span>{initials(company.company_name)}</span>
          )}
        </div>
        <div>
          <h2 className="profile-board-name">{company.company_name}</h2>
          <p className="profile-board-email">{company.email}</p>
        </div>
      </div>

      <dl className="profile-board-meta">
        <div>
          <dt>Status</dt>
          <dd className={`profile-board-status profile-board-status--${company.status}`}>
            {company.status}
          </dd>
        </div>
        <div>
          <dt>Balance</dt>
          <dd>{balance} credits</dd>
        </div>
        <div>
          <dt>Documents</dt>
          <dd>{data.documents.total}</dd>
        </div>
        <div>
          <dt>On-chain</dt>
          <dd>{data.blockchain.total_signed}</dd>
        </div>
        <div>
          <dt>Criteria</dt>
          <dd>{data.criteria.enrolled}</dd>
        </div>
        <div>
          <dt>API keys</dt>
          <dd>{data.api.active_keys}</dd>
        </div>
      </dl>

      <nav className="profile-board-nav" aria-label="Account shortcuts">
        <Link href="/settings/profile" className="profile-board-link">
          <Settings size={14} />
          Profile
        </Link>
        <Link href="/settings/balance" className="profile-board-link">
          <Wallet size={14} />
          Balance
        </Link>
        <Link href="/settings/api-keys" className="profile-board-link">
          <Key size={14} />
          API keys
        </Link>
      </nav>
    </div>
  );
}
