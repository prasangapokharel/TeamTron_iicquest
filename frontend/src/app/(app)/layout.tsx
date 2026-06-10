"use client";

import { AuthGuard } from "@/components/dashboard/auth-guard";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="dash-shell app-grid-bg">
        <DashboardSidebar />
        <main className="dash-main">{children}</main>
      </div>
    </AuthGuard>
  );
}
