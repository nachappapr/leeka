import { ReportsSkeleton } from "@/components/reports/reports-skeleton";

export default function ReportsLoading() {
  return (
    <div role="status" aria-label="Loading reports" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      <ReportsSkeleton />
    </div>
  );
}
