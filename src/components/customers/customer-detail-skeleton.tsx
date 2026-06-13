import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/custom/card";
import { SkeletonBlock, SkeletonCircle } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonTable } from "@/components/ui/custom/skeleton-table";
import type { SkeletonTableColumn } from "@/components/ui/custom/skeleton-table";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";

const INVOICES_TABLE_COLUMNS: ReadonlyArray<SkeletonTableColumn> = [
  { kind: "text", headWidth: "w-16", cellClassName: "w-2/5 pl-6" },
  { kind: "text", headWidth: "w-12", cellClassName: "w-1/5" },
  { kind: "pill", headWidth: "w-12", cellClassName: "w-1/5" },
  { kind: "amount", align: "right", headWidth: "w-14", cellClassName: "w-1/5 pr-6" },
];

function SkeletonContactCard() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3.5">
        <SkeletonCircle className="size-18 shrink-0" />
        <div className="flex min-w-0 flex-col gap-2">
          <SkeletonBlock className="h-4 w-36" />
          <SkeletonBlock className="h-2.5 w-28" />
        </div>
      </div>

      <div className="my-4.5 border-t border-border" />

      <div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn("flex items-start gap-3 py-2.5", i !== 0 && "border-t border-border")}
          >
            <SkeletonBlock className="mt-0.5 size-8 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 mt-0.5">
              <SkeletonBlock className="h-2.5 w-12" />
              <SkeletonBlock className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4.5 flex gap-2">
        <SkeletonBlock className="h-9 flex-1 rounded-full" />
        <SkeletonBlock className="h-9 flex-1 rounded-full" />
      </div>
    </Card>
  );
}

function SkeletonStatTile() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <SkeletonBlock className="h-2.5 w-20" />
      <SkeletonBlock className="mt-1.5 h-6 w-28" />
      <SkeletonBlock className="mt-1 h-2.5 w-24" />
    </div>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-24" subtitleW="w-32" />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <header className="flex items-start justify-between gap-4 max-mobile:flex-col max-mobile:gap-3">
          <div className="flex min-w-0 items-center gap-3 max-mobile:w-full">
            <SkeletonCircle className="size-10 shrink-0" onBg />
            <div className="flex min-w-0 flex-col gap-2">
              <SkeletonBlock className="h-7 w-44" onBg />
              <SkeletonBlock className="h-3.5 w-56" onBg />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 max-mobile:w-full">
            <SkeletonBlock className="h-10 w-32 rounded-full max-mobile:flex-1" onBg />
            <SkeletonBlock className="h-10 w-32 rounded-full max-mobile:flex-1" onBg />
          </div>
        </header>

        {/* min-[901px] is the approved arbitrary variant already used in the real container */}
        <div className="grid grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[340px_minmax(0,1fr)]">
          <SkeletonContactCard />

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
              {[0, 1, 2].map((i) => (
                <SkeletonStatTile key={i} />
              ))}
            </div>

            <Card title="Invoices" headingLevel={3}>
              <div className="max-mobile:hidden">
                <SkeletonTable rows={4} columns={INVOICES_TABLE_COLUMNS} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
