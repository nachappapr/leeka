import { SkeletonBlock, SkeletonPill } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonPageHeader } from "@/components/ui/custom/skeleton-page-header";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";
import { Card } from "@/components/ui/custom/card";

function MobileTabsSkeleton() {
  return (
    <div className="min-mobile:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-2.5 pt-1 scrollbar-none">
      {(["w-24", "w-20", "w-16", "w-28", "w-20", "w-16"] as const).map((w, i) => (
        <SkeletonPill key={i} className={`h-11 shrink-0 ${w}`} />
      ))}
    </div>
  );
}

function AsideSkeleton() {
  return (
    <Card className="max-mobile:hidden">
      <div className="flex flex-col gap-0.5 p-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-10 w-full rounded-nav-item" />
        ))}
        <div className="mt-2 border-t border-line pt-2">
          <SkeletonBlock className="h-10 w-full rounded-nav-item" />
        </div>
      </div>
    </Card>
  );
}

function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-1.5 h-11 w-full rounded-nav-item" />
    </div>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <SkeletonBlock className="h-4.25 w-36" />
      </div>
      <div className="p-6">
        <div className="mb-5 flex items-center gap-4">
          <SkeletonBlock className="size-18 shrink-0 rounded-xl" />
          <SkeletonPill className="h-10 w-36" />
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton className="col-span-full" />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <SkeletonPill className="h-10 w-20" />
          <SkeletonPill className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-24" subtitleW="w-56" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <div className="max-mobile:hidden">
          <SkeletonPageHeader titleW="w-24" actions={0} />
        </div>

        <MobileTabsSkeleton />

        <div className="grid items-start gap-5 min-mobile:grid-cols-[240px_1fr]">
          <AsideSkeleton />
          <BusinessCardSkeleton />
        </div>
      </div>
    </div>
  );
}
