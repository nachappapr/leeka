import { Skeleton } from "@/components/ui/custom/skeleton";

export default function ActivityLoading() {
  return (
    <div role="status" aria-label="Loading activity" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      {/* Topbar skeleton */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-10 border-b border-border bg-background/85 px-7 py-3.5 max-mobile:px-4 max-mobile:py-3"
      >
        <Skeleton className="h-7 w-28" />
      </div>

      <div
        aria-hidden="true"
        className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24"
      >
        {/* Page header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>

        <div className="flex gap-5 max-tablet:flex-col">
          {/* Feed skeleton */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
          {/* Aside skeleton — hidden on tablet/mobile */}
          <div className="flex w-72 shrink-0 flex-col gap-4 max-tablet:hidden">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
