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
          <Skeleton className="h-8 w-24 mx-2 mb-6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full mb-2 mx-0" />
          ))}
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
