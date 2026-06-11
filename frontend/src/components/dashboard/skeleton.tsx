import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  delay,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("skeleton", className)}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
      aria-hidden
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dash-skeleton dash-skeleton--board" aria-busy="true" aria-label="Loading dashboard">
      <header className="dash-board-header">
        <div className="dash-board-header-main">
          <Skeleton className="skeleton-line skeleton-line--title" />
          <Skeleton className="skeleton-line skeleton-line--desc" delay={80} />
        </div>
        <div className="dash-board-header-actions">
          <Skeleton className="skeleton-btn" delay={120} />
          <Skeleton className="skeleton-btn skeleton-btn--wide" delay={160} />
        </div>
      </header>

      <section className="dash-board dash-board--loading">
        <div className="dash-board-metrics">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-board-metric dash-board-metric--skeleton">
              <Skeleton className="skeleton-metric-value" delay={i * 60} />
              <Skeleton className="skeleton-metric-label" delay={i * 60 + 40} />
            </div>
          ))}
        </div>

        <div className="dash-board-analytics">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dash-board-cell dash-board-cell--skeleton">
              <Skeleton className="skeleton-line skeleton-line--cell-title" delay={i * 70} />
              <Skeleton className="skeleton-line skeleton-line--cell-desc" delay={i * 70 + 50} />
              <Skeleton
                className={cn(
                  "skeleton-chart",
                  i === 0 && "skeleton-chart--donut",
                  i === 1 && "skeleton-chart--ring",
                )}
                delay={i * 70 + 100}
              />
            </div>
          ))}
        </div>

        <div className="dash-board-body">
          <div className="dash-board-cell dash-board-cell--table dash-board-cell--skeleton">
            <div className="dash-skeleton-section-head">
              <div className="dash-skeleton-section-copy">
                <Skeleton className="skeleton-line skeleton-line--cell-title" />
                <Skeleton className="skeleton-line skeleton-line--cell-desc" delay={60} />
              </div>
              <Skeleton className="skeleton-line skeleton-line--link" delay={90} />
            </div>
            <div className="dash-skeleton-rows">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="dash-skeleton-row">
                  <Skeleton className="skeleton-row-primary" delay={i * 50} />
                  <Skeleton className="skeleton-row-badge" delay={i * 50 + 30} />
                  <Skeleton className="skeleton-row-num" delay={i * 50 + 60} />
                </div>
              ))}
            </div>
          </div>

          <div className="dash-board-cell dash-board-cell--profile dash-board-cell--skeleton">
            <div className="dash-skeleton-profile-head">
              <Skeleton className="skeleton-avatar" />
              <div className="dash-skeleton-profile-copy">
                <Skeleton className="skeleton-line skeleton-line--profile-title" delay={40} />
                <Skeleton className="skeleton-line skeleton-line--profile-desc" delay={80} />
              </div>
            </div>
            <Skeleton className="skeleton-block skeleton-block--btn" delay={120} />
            <div className="dash-skeleton-stat-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-stat-tile" delay={i * 45} />
              ))}
            </div>
            <div className="dash-skeleton-links">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-link-row" delay={i * 40} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
