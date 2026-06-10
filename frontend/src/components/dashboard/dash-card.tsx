import { cn } from "@/lib/utils";

export function DashCard({
  children,
  className,
  padding = true,
  flush = false,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        flush ? "dash-cell-inner" : "dash-card",
        padding && "dash-card-padded",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DashCardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="dash-card-header">
      <div>
        <h2 className="dash-card-title">{title}</h2>
        {subtitle && <p className="dash-card-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
