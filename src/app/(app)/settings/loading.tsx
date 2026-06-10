import { Skeleton } from "@/components/ui/primitives/skeleton";

export default function SettingsLoading() {
  return (
    <div role="status" aria-label="Loading settings" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>
      {/* Topbar skeleton */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-10 border-b border-border bg-background/85 px-7 py-3.5 max-mobile:px-4 max-mobile:py-3"
      >
        <Skeleton className="h-7 w-24" />
      </div>

      <div aria-hidden="true" className="flex flex-1 gap-6 p-7 max-tablet:flex-col max-mobile:p-4">
        {/* Sidebar tabs skeleton — hidden on mobile */}
        <div className="w-44 shrink-0 max-tablet:hidden">
          <div className="flex flex-col gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-nav-item" />
            ))}
          </div>
        </div>

        {/* Content area skeleton */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
