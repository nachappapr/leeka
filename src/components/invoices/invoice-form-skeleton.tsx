import {
  SkeletonBlock,
  SkeletonCircle,
  SkeletonPill,
} from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonPageHeader } from "@/components/ui/custom/skeleton-page-header";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";
import { Card } from "@/components/ui/custom/card";

function StepHead() {
  return (
    <div className="flex items-start gap-3 mb-3.5">
      <SkeletonCircle className="size-7.5 shrink-0" />
      <div className="min-w-0 flex-1 pt-px flex flex-col gap-2">
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-3.5 w-64" />
      </div>
    </div>
  );
}

function ItemsEyebrow() {
  return (
    <div className="flex items-center gap-2 mt-1 mb-3">
      <SkeletonBlock className="h-3 w-12 mr-auto" />
      <SkeletonPill className="h-8 w-24" />
      <SkeletonPill className="h-8 w-26" />
    </div>
  );
}

function DesktopItemsGrid() {
  return (
    <div className="max-mobile:hidden">
      <div className="grid grid-cols-[1fr_90px_60px_100px_90px_80px_100px_40px] gap-2 pb-2 border-b border-border">
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <SkeletonBlock className="h-2.5 w-full" />
        <span />
      </div>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[1fr_90px_60px_100px_90px_80px_100px_40px] gap-2 py-1.5 border-b border-border last:border-b-0 items-center"
        >
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="size-8 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function MobileItemCards() {
  return (
    <div className="min-mobile:hidden flex flex-col gap-3">
      <MobileItemCard />
      <MobileItemCard />
    </div>
  );
}

function MobileItemCard() {
  return (
    <div className="rounded-2xl bg-background border border-border p-3.5 pb-4">
      <div className="flex items-center justify-between mb-2.5">
        <SkeletonBlock className="h-3 w-14" />
        <SkeletonBlock className="size-8 rounded-sm" />
      </div>
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="h-11 w-full rounded-nav-item mt-1.5" />
      <div className="mt-3">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-11 w-full rounded-nav-item mt-1.5" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <SkeletonBlock className="h-3 w-10" />
            <SkeletonBlock className="h-11 w-full rounded-nav-item mt-1.5" />
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {[0, 1].map((i) => (
          <div key={i}>
            <SkeletonBlock className="h-3 w-10" />
            <SkeletonBlock className="h-11 w-full rounded-nav-item mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TotalsStrip() {
  return (
    <div className="flex justify-end">
      <div className="w-65 space-y-2">
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <div className="flex justify-between">
          <SkeletonBlock className="h-3 w-12" />
          <SkeletonBlock className="h-3 w-16" />
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <SkeletonBlock className="h-3.5 w-16" />
          <SkeletonBlock className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

function PreviewSidebar() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <SkeletonBlock className="h-2.5 w-40" onBg />
        <SkeletonBlock className="h-2.5 w-12" onBg />
      </div>
      <div className="rounded-lg border border-border bg-card p-7 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="size-11 rounded-md" />
            <SkeletonBlock className="h-3.5 w-32" />
            <SkeletonBlock className="h-2.5 w-28" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <SkeletonBlock className="h-2.5 w-11" />
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-2.5 w-16" />
          </div>
        </div>
        <hr className="my-4 border-t border-border" />
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <SkeletonBlock className="h-2 w-12" />
              <SkeletonBlock className="h-3 w-4/5" />
            </div>
          ))}
        </div>
        <SkeletonBlock className="h-16 w-full rounded-sm mt-4" />
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between">
            <SkeletonBlock className="h-2.5 w-12" />
            <SkeletonBlock className="h-2.5 w-16" />
          </div>
          <div className="flex justify-between">
            <SkeletonBlock className="h-2.5 w-16" />
            <SkeletonBlock className="h-2.5 w-20" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-sm mt-2" />
        </div>
      </div>
    </div>
  );
}

export function InvoiceFormSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-40" subtitle={false} />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <SkeletonPageHeader back variant="pill" titleW="w-44" />
        <div className="grid grid-cols-[1fr_480px] max-tablet:grid-cols-1 gap-5">
          <div className="flex flex-col gap-4">
            <Card>
              <div className="px-6 py-5">
                <StepHead />
                <SkeletonBlock className="h-12 w-full rounded-md" />
              </div>
            </Card>

            <Card>
              <div className="px-6 py-5">
                <StepHead />
                <ItemsEyebrow />
                <DesktopItemsGrid />
                <MobileItemCards />
                <hr className="my-3.5 border-t border-border" />
                <TotalsStrip />
              </div>
            </Card>

            <Card>
              <div className="px-6 py-5">
                <StepHead />
                <SkeletonBlock className="h-20 w-full rounded-md" />
              </div>
            </Card>

            <div className="flex items-center gap-2.5 mt-1 max-mobile:hidden">
              <SkeletonPill className="h-11 w-28" />
              <div className="flex-1" />
              <SkeletonPill className="h-11 w-28" />
              <SkeletonPill className="h-11 w-44" />
            </div>
          </div>

          <div className="sticky top-23 self-start max-mobile:hidden">
            <PreviewSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
