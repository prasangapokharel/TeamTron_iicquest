"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { DashboardSkeleton, Skeleton } from "@/components/dashboard/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="dash-shell app-grid-bg">
        <aside className="dash-sidebar dash-sidebar--skeleton">
          <div className="dash-sidebar-skeleton-brand">
            <Skeleton className="skeleton-sidebar-logo" />
            <Skeleton className="skeleton-sidebar-wordmark" delay={60} />
          </div>
          <div className="dash-sidebar-skeleton-nav">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="skeleton-sidebar-link" delay={i * 45} />
            ))}
          </div>
          <div className="dash-sidebar-skeleton-foot">
            <Skeleton className="skeleton-sidebar-user" delay={280} />
            <Skeleton className="skeleton-sidebar-logout" delay={320} />
          </div>
        </aside>
        <main className="dash-main">
          <div className="dash-content">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}
