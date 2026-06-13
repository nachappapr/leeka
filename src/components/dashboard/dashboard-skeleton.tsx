import {
  SkeletonBlock,
  SkeletonCircle,
  SkeletonPill,
} from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonTable } from "@/components/ui/custom/skeleton-table";
import type { SkeletonTableColumn } from "@/components/ui/custom/skeleton-table";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";

const INVOICES_TABLE_COLUMNS: ReadonlyArray<SkeletonTableColumn> = [
  { kind: "avatar", cellClassName: "w-2/6 pl-6", headWidth: "w-16" },
  { kind: "text", cellClassName: "w-1/6", bodyWidth: "w-14", headWidth: "w-12" },
  { kind: "text", cellClassName: "w-1/6", bodyWidth: "w-16", headWidth: "w-10" },
  { kind: "pill", cellClassName: "w-1/6", bodyWidth: "w-16", headWidth: "w-12" },
  {
    kind: "amount",
    cellClassName: "w-1/6 text-right",
    align: "right",
    bodyWidth: "w-16",
    headWidth: "w-14",
  },
  {
    kind: "action",
    cellClassName: "w-15 pr-6 text-center",
    bodyWidth: "w-10",
    headWidth: "w-0",
  },
];

const BAR_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-1/3"] as const;

function GreetingSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4 max-mobile:hidden">
      <div>
        <SkeletonBlock className="h-7 w-48" onBg />
        <SkeletonBlock className="mt-1 h-3.5 w-64" onBg />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <SkeletonBlock className="h-10 w-28 rounded-full" onBg />
        <SkeletonBlock className="h-10 w-28 rounded-full" onBg />
      </div>
    </div>
  );
}

function HeroGridSkeleton() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 max-tablet:grid-cols-2 max-mobile:grid-cols-1 max-mobile:gap-3">
      <div className="relative overflow-hidden rounded-xl bg-linear-135 from-coral to-coral-deep p-7 shadow-coral-hero max-tablet:col-span-2 max-mobile:col-span-1 max-mobile:p-5">
        <span className="h-2.75 w-32 rounded-md bg-white/25 block" />
        <span className="mt-2.5 h-10 w-48 rounded-lg bg-white/25 block" />
        <div className="mt-3.5 flex items-center gap-3">
          <span className="h-5.5 w-28 rounded-full bg-white/25 block" />
          <span className="h-5.5 w-32 rounded-full bg-white/25 block" />
        </div>
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl bg-card p-6 shadow-card max-mobile:p-4">
          <div className="flex items-start justify-between gap-2">
            <SkeletonBlock className="h-2.75 w-28" />
            <SkeletonBlock className="size-9.5 rounded-md shrink-0" />
          </div>
          <SkeletonBlock className="mt-4 h-7.5 w-36" />
          <SkeletonBlock className="mt-3 h-2.75 w-24" />
        </div>
      ))}
    </div>
  );
}

function InvoicesCardSkeleton() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <SkeletonBlock className="h-4.25 w-36" />
        <SkeletonBlock className="h-3.5 w-16" />
      </div>
      <div className="max-mobile:hidden">
        <SkeletonTable className="table-fixed" rows={5} columns={INVOICES_TABLE_COLUMNS} />
      </div>
      <ul className="min-mobile:hidden flex flex-col gap-3 p-4" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="rounded-2xl bg-card shadow-card">
            <div className="flex items-center gap-3 p-4">
              <SkeletonCircle className="size-11 shrink-0" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <SkeletonBlock className="h-3.5 w-32" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonPill className="h-5.5 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-12" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityCardSkeleton() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <SkeletonBlock className="h-4.25 w-20" />
      </div>
      <div className="flex flex-col px-6">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={"flex items-start gap-3 py-3.5" + (i < 3 ? " border-b border-border" : "")}
          >
            <SkeletonCircle className="size-9 shrink-0" />
            <div className="flex flex-col gap-2 min-w-0 flex-1">
              <SkeletonBlock className="h-3.5 w-40" />
              <SkeletonBlock className="mt-0.5 h-2.25 w-24 opacity-70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoneyAwaitedCardSkeleton() {
  return (
    <div className="rounded-xl bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <SkeletonBlock className="h-4.25 w-44" />
      </div>
      <div className="flex flex-col gap-3 px-6 py-4">
        {BAR_WIDTHS.map((fillWidth, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <SkeletonBlock className="h-3 w-20" />
            <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
              <SkeletonBlock className={`h-full rounded-full ${fillWidth}`} />
            </div>
            <SkeletonBlock className="h-3 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-32" subtitleW="w-44" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <div className="flex flex-col gap-5 max-mobile:gap-3.5">
          <GreetingSkeleton />
          <HeroGridSkeleton />
          <div className="grid grid-cols-[2fr_1fr] gap-5 max-tablet:grid-cols-1 max-mobile:gap-3.5">
            <InvoicesCardSkeleton />
            <div className="flex flex-col gap-5">
              <ActivityCardSkeleton />
              <MoneyAwaitedCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
