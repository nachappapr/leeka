import { Skeleton } from "@/components/ui/primitives/skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      {/* Topbar skeleton */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-10 border-b border-border bg-background/85 px-7 py-3.5 max-mobile:px-4 max-mobile:py-3"
      >
        <Skeleton className="h-7 w-40" />
      </div>

      <div
        aria-hidden="true"
        className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24"
      >
        {/* Hero grid skeleton */}
        <div className="grid grid-cols-3 gap-4 max-tablet:grid-cols-1">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        {/* Invoices card skeleton */}
        <div className="flex gap-5 max-tablet:flex-col">
          <Skeleton className="min-h-64 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
