import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <DashboardSkeleton />
    </div>
  );
}
