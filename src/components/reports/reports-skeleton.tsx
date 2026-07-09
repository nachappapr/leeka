import { cn } from "@/lib/utils";
import { SkeletonBlock, SkeletonPill } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";

const BAR_HEIGHTS = [
  "h-20",
  "h-32",
  "h-44",
  "h-16",
  "h-52",
  "h-24",
  "h-12",
  "h-10",
  "h-20",
  "h-16",
  "h-8",
  "h-14",
] as const;

function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-card p-5 shadow-card">
      <SkeletonBlock className="h-2.5 w-20" />
      <SkeletonBlock className="h-7 w-28" />
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-1 flex-col">
      <SkeletonTopbar titleW="w-24" subtitleW="w-40" />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        {/* Range chips */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2">
            <SkeletonPill className="h-9 w-14 shrink-0" />
            <SkeletonPill className="h-9 w-14 shrink-0" />
            <SkeletonPill className="h-9 w-14 shrink-0" />
            <SkeletonPill className="h-9 w-14 shrink-0" />
          </div>
        </div>

        {/* Metric grid — mirrors the real section shell */}
        <div className="grid grid-cols-4 gap-4 max-tablet:grid-cols-2 max-mobile:grid-cols-2 max-mobile:gap-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Chart block — card-framed, matching the real layout */}
        <div className="h-108 w-full rounded-xl bg-card p-4 shadow-card max-mobile:h-78 max-mobile:p-3">
          <div className="flex h-full items-end gap-2">
            {BAR_HEIGHTS.map((h, i) => (
              <SkeletonBlock
                key={i}
                className={cn("flex-1 max-w-12 rounded-t-md", h, i >= 6 && "opacity-50")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
