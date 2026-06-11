import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  green: "status-verified",
  orange: "status-warning",
  yellow: "status-warning",
  red: "status-critical",
  review: "status-warning",
  verified: "status-verified",
  failed: "status-critical",
  pending: "badge-pending",
};

export function VerdictBadge({ verdict, className }: { verdict?: string; className?: string }) {
  if (!verdict) return <span className={cn("badge badge-ignored", className)}>n/a</span>;
  const key = verdict.toLowerCase();
  return (
    <span className={cn("badge", STYLES[key] ?? "badge-ignored", className)}>
      {verdict.toUpperCase()}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    green: "var(--success)",
    orange: "var(--warning)",
    yellow: "var(--warning)",
    red: "var(--danger)",
  };
  return (
    <span
      className="inline-block w-2 h-2 shrink-0"
      style={{ background: colors[severity.toLowerCase()] ?? "var(--text-muted)" }}
    />
  );
}
