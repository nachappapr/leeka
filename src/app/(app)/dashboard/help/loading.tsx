import { Skeleton } from "@/components/ui/primitives/skeleton";

export default function DashboardHelpLoading() {
  return (
    <div role="status" aria-label="Loading help" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      {/* Topbar skeleton */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-10 border-b border-border bg-background/85 px-7 py-3.5 max-mobile:px-4 max-mobile:py-3"
      >
        <Skeleton className="h-7 w-16" />
      </div>

      <div
        aria-hidden="true"
        className="flex flex-1 items-center justify-center p-7 max-mobile:p-4"
      >
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-16 rounded-2xl" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}
