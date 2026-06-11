"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Upload } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import {
  StatusDonutChart,
  VerificationRateChart,
  ActivityAreaChart,
} from "@/components/dashboard/dashboard-charts";
import { balanceApi, companyApi } from "@/lib/api";
import type { DashboardData } from "@/types/api";
import { VerdictBadge } from "@/components/verify/verdict-badge";

const SHIMMER_MIN_MS = 380;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    Promise.all([companyApi.dashboard(), balanceApi.get()])
      .then(([dash, bal]) => {
        const elapsed = Date.now() - started;
        const delay = Math.max(0, SHIMMER_MIN_MS - elapsed);
        window.setTimeout(() => {
          if (cancelled) return;
          setData(dash);
          setBalance(bal.balance);
          setShowContent(true);
        }, delay);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="dash-content dash-content--saas">
        <p className="auth-error">{error}</p>
      </div>
    );
  }

  if (!data || !showContent) {
    return (
      <div className="dash-content dash-content--saas">
        <DashboardSkeleton />
      </div>
    );
  }

  const metrics = [
    { label: "Verified", value: data.documents.verified, tone: "success" as const },
    { label: "Failed", value: data.documents.failed, tone: "danger" as const },
    { label: "Pending", value: data.documents.pending, tone: "warning" as const },
    { label: "On-chain", value: data.blockchain.total_signed, tone: "primary" as const },
  ];

  return (
    <div className="dash-content dash-content--saas dash-page-enter">
      <PageHeader
        title="Dashboard"
        description={`${data.company.company_name} · ${balance} credits · ${data.documents.total} documents`}
        actions={
          <>
            <Link href="/documents" className="dash-btn dash-btn--ghost">
              Documents
            </Link>
            <Link href="/documents" className="dash-btn dash-btn--primary">
              <Upload size={14} />
              New verification
            </Link>
          </>
        }
      />

      <section className="dash-board" aria-label="Dashboard overview">
        <div className="dash-board-metrics">
          {metrics.map((m) => (
            <div key={m.label} className="dash-board-metric">
              <span className={`dash-board-metric-dot dash-board-metric-dot--${m.tone}`} />
              <div>
                <p className="dash-board-metric-value">{m.value}</p>
                <p className="dash-board-metric-label">{m.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-board-analytics">
          <div className="dash-board-cell">
            <StatusDonutChart data={data.documents} flush />
          </div>
          <div className="dash-board-cell">
            <VerificationRateChart rate={data.documents.verification_rate_pct} flush />
          </div>
          <div className="dash-board-cell">
            <ActivityAreaChart recent={data.recent_verifications} flush />
          </div>
        </div>

        <div className="dash-board-body">
          <div className="dash-board-cell dash-board-cell--table">
            <div className="dash-cell-head">
              <div>
                <h2 className="dash-cell-title">Recent verifications</h2>
                <p className="dash-cell-desc">
                  {data.documents.verification_rate_pct}% pass rate across {data.documents.total} runs
                </p>
              </div>
              <Link href="/documents" className="dash-text-link">
                View all <ArrowUpRight size={13} />
              </Link>
            </div>

            {data.recent_verifications.length === 0 ? (
              <div className="dash-board-empty">
                <p>No verifications yet.</p>
                  <Link href="/documents" className="dash-text-link">
                    Upload documents <ArrowUpRight size={13} />
                  </Link>
              </div>
            ) : (
              <table className="dash-data-table">
                <thead>
                  <tr>
                    <th>Criteria</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {data.recent_verifications.map((v) => (
                    <tr key={v.enroll_id}>
                      <td>
                        <Link href={`/documents/${v.enroll_id}/result`} className="dash-table-link">
                          <span>{v.criteria_name ?? "Document"}</span>
                          <code>{v.enroll_id.slice(0, 8)}</code>
                        </Link>
                      </td>
                      <td>{v.verdict ? <VerdictBadge verdict={v.verdict} /> : "—"}</td>
                      <td className="dash-table-num">{v.risk_score ?? "—"}</td>
                      <td className="dash-table-action">
                        <Link href={`/documents/${v.enroll_id}/result`} aria-label="Open">
                          <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dash-board-cell dash-board-cell--profile">
            <ProfilePanel company={data.company} balance={balance} data={data} />
          </div>
        </div>
      </section>
    </div>
  );
}
