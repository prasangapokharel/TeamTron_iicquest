import { DashboardSkeleton } from "@/components/dashboard/skeleton";

export default function DashboardLoading() {
  return (
    <div className="dash-content dash-content--saas">
      <DashboardSkeleton />
    </div>
  );
}
