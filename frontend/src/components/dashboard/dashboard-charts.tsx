"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { DashboardData, RecentVerification } from "@/types/api";
import { DashCard, DashCardHeader } from "./dash-card";

const COLORS = {
  verified: "#22c55e",
  failed: "#ef4444",
  pending: "#f59e0b",
  review: "#a78bfa",
  primary: "#5eead4",
  muted: "#3f3f46",
  track: "rgba(255,255,255,0.06)",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip-label">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: p.color ?? COLORS.primary }} />
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function ChartEmpty({ message, action }: { message: string; action?: { href: string; label: string } }) {
  return (
    <div className="chart-empty-state chart-empty-state--minimal">
      <p>{message}</p>
      {action && (
        <Link href={action.href} className="chart-empty-link">
          {action.label} <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );
}

function RateRing({ rate }: { rate: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (rate / 100) * c;

  return (
    <div className="rate-ring-wrap">
      <svg viewBox="0 0 128 128" className="rate-ring-svg">
        <circle cx="64" cy="64" r={r} fill="none" stroke={COLORS.track} strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="url(#rateRingGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          className="rate-ring-progress"
        />
        <defs>
          <linearGradient id="rateRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="rate-ring-center">
        <span className="rate-ring-value">{rate}%</span>
        <span className="rate-ring-label">pass rate</span>
      </div>
    </div>
  );
}

export function StatusDonutChart({
  data,
  flush = false,
}: {
  data: DashboardData["documents"];
  flush?: boolean;
}) {
  const items = [
    { name: "Verified", value: data.verified, color: COLORS.verified },
    { name: "Failed", value: data.failed, color: COLORS.failed },
    { name: "Pending", value: data.pending, color: COLORS.pending },
  ];
  const chartData = items.filter((d) => d.value > 0);
  const total = data.total;
  const isEmpty = total === 0;

  const displayData = isEmpty
    ? [
        { name: "Verified", value: 1, color: COLORS.muted },
        { name: "Failed", value: 1, color: COLORS.muted },
        { name: "Pending", value: 1, color: COLORS.muted },
      ]
    : chartData;

  return (
    <DashCard className="chart-card chart-card--donut" flush={flush} padding={!flush}>
      <DashCardHeader title="Document Status" subtitle="Breakdown by verification state" />
      <div className={`chart-donut-wrap${isEmpty ? " chart-donut-wrap--empty" : ""}`}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={104}
              paddingAngle={isEmpty ? 4 : 3}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, i) => (
                <Cell key={i} fill={entry.color} opacity={isEmpty ? 0.35 : 1} />
              ))}
            </Pie>
            {!isEmpty && <Tooltip content={<ChartTooltip />} />}
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-donut-center">
          <span className="chart-donut-total">{total}</span>
          <span className="chart-donut-label">Total docs</span>
        </div>
      </div>
      <ul className="chart-legend chart-legend--spread">
        {items.map((item) => (
          <li key={item.name}>
            <span className="chart-legend-dot" style={{ background: item.color }} />
            <span>{item.name}</span>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </DashCard>
  );
}

export function VerificationRateChart({ rate, flush = false }: { rate: number; flush?: boolean }) {
  return (
    <DashCard className="chart-card chart-card--rate" flush={flush} padding={!flush}>
      <DashCardHeader title="Pass rate" subtitle="Documents clearing all checks" />
      <div className="chart-rate-body chart-rate-body--compact">
        <RateRing rate={rate} />
      </div>
    </DashCard>
  );
}

export function RiskScoreChart({ recent }: { recent: RecentVerification[] }) {
  const chartData = recent
    .filter((r) => r.risk_score != null)
    .map((r, i) => ({
      name: r.criteria_name?.slice(0, 14) ?? `Doc ${i + 1}`,
      score: r.risk_score ?? 0,
    }))
    .reverse();

  return (
    <DashCard className="chart-card chart-card--risk">
      <DashCardHeader title="Risk Scores" subtitle="Recent verification outcomes" />
      {chartData.length === 0 ? (
        <ChartEmpty
          message="No scored verifications yet. Run your first check to see risk analytics."
          action={{ href: "/documents", label: "Start verification" }}
        />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="score" name="Risk Score" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, i) => {
                const c =
                  entry.score >= 80 ? COLORS.verified : entry.score >= 50 ? COLORS.pending : COLORS.failed;
                return <Cell key={i} fill={c} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashCard>
  );
}

export function ActivityAreaChart({
  recent,
  flush = false,
}: {
  recent: RecentVerification[];
  flush?: boolean;
}) {
  const hasData = recent.some((r) => r.risk_score != null);
  const chartData = hasData
    ? recent
        .slice()
        .reverse()
        .map((r, i) => ({ idx: `Run ${i + 1}`, score: r.risk_score ?? 0 }))
  : [
      { idx: "", score: 0 },
      { idx: "", score: 0 },
      { idx: "", score: 0 },
    ];

  return (
    <DashCard className="chart-card chart-card--activity" flush={flush} padding={!flush}>
      <DashCardHeader title="Activity" subtitle="Recent risk scores" />
      {!hasData ? (
        <ChartEmpty message="Run a verification to see activity." />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(94, 234, 212, 0.4)" />
                <stop offset="100%" stopColor="rgba(94, 234, 212, 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="idx" tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              name="Risk Score"
              stroke={COLORS.primary}
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{ fill: COLORS.primary, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </DashCard>
  );
}

export function UsageOverviewChart({ data }: { data: DashboardData }) {
  const chartData = [
    { name: "Signed", value: data.blockchain.total_signed },
    { name: "API Keys", value: data.api.active_keys },
    { name: "Criteria", value: data.criteria.enrolled },
    { name: "Payments", value: data.financials.total_payments },
  ];
  const allZero = chartData.every((d) => d.value === 0);

  return (
    <DashCard className="chart-card chart-card--usage">
      <DashCardHeader title="Platform Usage" subtitle="Blockchain, API, and billing snapshot" />
      {allZero ? (
        <ChartEmpty message="Usage metrics populate as you verify documents and configure API keys." />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#737373", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]} maxBarSize={56}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="url(#usageBarGrad)" />
              ))}
            </Bar>
            <defs>
              <linearGradient id="usageBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashCard>
  );
}
