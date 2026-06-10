import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton skeleton--flat", className)} aria-hidden />;
}

export function DashboardSkeleton() {
  return (
    <div className="dash-skeleton dash-skeleton--board" aria-busy="true" aria-label="Loading dashboard">
      <div className="dash-board-header">
        <div className="dash-board-header-main">
          <Skeleton className="h-5 w-32 mb-2.5" />
          <Skeleton className="h-3.5 w-72 max-w-full" />
        </div>
        <div className="dash-board-header-actions">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>

      <section className="dash-board dash-board--loading">
        <div className="dash-board-metrics">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-board-metric">
              <Skeleton className="h-1.5 w-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        <div className="dash-board-analytics">
          <div className="dash-board-cell">
            <Skeleton className="h-3.5 w-28 mb-1" />
            <Skeleton className="h-3 w-44 mb-5" />
            <div className="dash-skeleton-donut">
              <Skeleton className="dash-skeleton-donut-ring" />
              <div className="dash-skeleton-donut-hole" />
            </div>
            <div className="dash-skeleton-legend">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="dash-board-cell">
            <Skeleton className="h-3.5 w-24 mb-1" />
            <Skeleton className="h-3 w-40 mb-5" />
            <Skeleton className="dash-skeleton-ring mx-auto" />
          </div>
          <div className="dash-board-cell">
            <Skeleton className="h-3.5 w-20 mb-1" />
            <Skeleton className="h-3 w-36 mb-5" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        <div className="dash-board-body">
          <div className="dash-board-cell dash-board-cell--table">
            <div className="dash-cell-head mb-4">
              <div className="flex-1">
                <Skeleton className="h-3.5 w-36 mb-2" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="dash-skeleton-table">
              <div className="dash-skeleton-table-head">
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-10" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="dash-skeleton-table-row">
                  <div>
                    <Skeleton className="h-3.5 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-3.5 w-8" />
                </div>
              ))}
            </div>
          </div>

          <div className="dash-board-cell dash-board-cell--profile">
            <div className="dash-skeleton-profile-head">
              <Skeleton className="h-10 w-10 shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-3.5 w-full mb-2" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
            <Skeleton className="h-9 w-full mb-4" />
            <div className="dash-skeleton-profile-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mt-2" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
