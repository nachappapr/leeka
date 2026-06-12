import { Skeleton } from "@/components/ui/custom/skeleton";

export default function ReportsLoading() {
  return (
    <div role="status" aria-label="Loading reports" className="flex flex-1 flex-col">
      <span className="sr-only">Loading…</span>

      <div
        aria-hidden="true"
        className="sticky top-0 z-10 border-b border-border bg-background/85 px-7 py-3.5 max-mobile:px-4 max-mobile:py-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24"
      >
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-4 gap-4 max-tablet:grid-cols-2 max-mobile:grid-cols-2 max-mobile:gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>

        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
