import type { ReactNode } from "react";

import { SkeletonBlock, SkeletonPill } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";
import { SkeletonPageHeader } from "@/components/ui/custom/skeleton-page-header";

const CHIP_WIDTHS = ["w-13", "w-22", "w-16", "w-19", "w-24", "w-22"] as const;

// Per-row text-block widths for the two notification groups (4 rows, then 3 rows)
const GROUP_ROW_WIDTHS: ReadonlyArray<ReadonlyArray<string>> = [
  ["w-3/5", "w-2/3", "w-1/2", "w-3/5"],
  ["w-2/3", "w-1/2", "w-3/5"],
];

function CardShell({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-card shadow-card overflow-hidden">{children}</div>;
}

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="border-b border-border px-6 py-4">{children}</div>;
}

function FeedSkeleton() {
  return (
    <CardShell>
      {/* Filter chip row */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-border overflow-hidden">
        {CHIP_WIDTHS.map((w, i) => (
          <SkeletonPill key={i} className={`h-9 shrink-0 ${w}`} />
        ))}
      </div>

      {/* Two day groups */}
      {GROUP_ROW_WIDTHS.map((rowWidths, gi) => (
        <div key={gi}>
          {/* Group label */}
          <div className="px-5 pt-4 pb-2 lg:px-6 lg:pt-5 lg:pb-2.5">
            <SkeletonBlock className="h-2.5 w-16" />
          </div>

          {/* Notification rows */}
          <ul>
            {rowWidths.map((textW, ri) => (
              <li
                key={ri}
                className="flex gap-3 pl-5 pr-4 pt-3 pb-3.5 lg:pl-6 lg:pr-5 lg:pt-2.5 lg:pb-3"
              >
                {/* Icon tile — matches NotificationIcon default: w-9 h-9 rounded-md */}
                <SkeletonBlock className="w-9 h-9 rounded-md self-start shrink-0" />
                <div className="min-w-0 flex-1 self-center flex flex-col gap-1.5">
                  <SkeletonBlock className={`h-3 ${textW}`} />
                  <SkeletonBlock className="h-2.5 w-16" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </CardShell>
  );
}

function GlanceCardSkeleton() {
  return (
    <CardShell>
      <CardHeader>
        <SkeletonBlock className="h-5 w-40" />
      </CardHeader>
      <ul className="flex flex-col gap-1 px-4 py-3">
        {([0, 1, 2, 3, 4] as const).map((i) => (
          <li key={i} className="flex items-center gap-3 px-2 py-2">
            <SkeletonBlock className="size-8 rounded-lg shrink-0" />
            <SkeletonBlock className="h-3 flex-1" />
            <SkeletonBlock className="h-3.5 w-6" />
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

function PrefsCardSkeleton() {
  return (
    <CardShell>
      <CardHeader>
        <SkeletonBlock className="h-5 w-28" />
      </CardHeader>
      <div className="px-6 py-4 flex flex-col gap-4">
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-4/5" />
        <SkeletonBlock className="h-10 w-full rounded-full" />
      </div>
    </CardShell>
  );
}

function AsideSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-5 max-tablet:hidden">
      <GlanceCardSkeleton />
      <PrefsCardSkeleton />
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-20" subtitle />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <SkeletonPageHeader actions={2} titleW="w-24" />
        <div className="flex gap-5 max-tablet:flex-col">
          <div className="min-w-0 flex-1">
            <FeedSkeleton />
          </div>
          <AsideSkeleton />
        </div>
      </div>
    </div>
  );
}
