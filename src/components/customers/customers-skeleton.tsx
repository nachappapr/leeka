import { SkeletonBlock, SkeletonCircle } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonTable } from "@/components/ui/custom/skeleton-table";
import type { SkeletonTableColumn } from "@/components/ui/custom/skeleton-table";
import { SkeletonPageHeader } from "@/components/ui/custom/skeleton-page-header";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";
import { Card } from "@/components/ui/custom/card";

const CUSTOMERS_TABLE_COLUMNS: ReadonlyArray<SkeletonTableColumn> = [
  { kind: "avatar", cellClassName: "w-2/6 pl-6", headWidth: "w-16" },
  { kind: "text", cellClassName: "w-1/6", bodyWidth: "w-20", headWidth: "w-10" },
  { kind: "text", cellClassName: "w-1/6", bodyWidth: "w-10", headWidth: "w-12" },
  {
    kind: "amount",
    cellClassName: "w-1/6 text-right",
    align: "right",
    bodyWidth: "w-16",
    headWidth: "w-14",
  },
  {
    kind: "amount",
    cellClassName: "w-1/6 pr-6 text-right",
    align: "right",
    bodyWidth: "w-16",
    headWidth: "w-16",
  },
];

function MobileCardsSkeleton() {
  return (
    <div className="p-4 min-mobile:hidden">
      <ul className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <li key={i} className="rounded-2xl bg-card shadow-card">
            <div className="flex items-center gap-3 p-4">
              <SkeletonCircle className="size-11 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <SkeletonBlock className="h-3.5 w-32" />
                <SkeletonBlock className="h-3 w-28" />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonBlock className="h-3 w-8" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-16" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CustomersSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-32" subtitleW="w-44" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <SkeletonPageHeader actions={1} titleW="w-32" />
        <Card>
          <div className="flex items-center border-b border-border px-6 py-4 max-mobile:hidden">
            <div className="max-w-xs w-full">
              <SkeletonBlock className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="max-mobile:hidden">
            <SkeletonTable className="table-fixed" rows={7} columns={CUSTOMERS_TABLE_COLUMNS} />
          </div>
          <MobileCardsSkeleton />
        </Card>
      </div>
    </div>
  );
}
