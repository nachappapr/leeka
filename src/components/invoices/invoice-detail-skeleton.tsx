import { SkeletonBlock, SkeletonPill } from "@/components/ui/custom/skeleton-shimmer";
import { SkeletonPageHeader } from "@/components/ui/custom/skeleton-page-header";
import { SkeletonTopbar } from "@/components/ui/custom/skeleton-topbar";

function PreviewCardSkeleton() {
  return (
    <article className="rounded-2xl bg-card p-8 shadow-card max-mobile:p-4.5">
      <div className="flex items-start justify-between gap-4 max-mobile:flex-col">
        <div>
          <SkeletonBlock className="size-14 rounded-xl" />
          <SkeletonBlock className="mt-3 h-6 w-44" />
          <div className="mt-1.5 flex flex-col gap-1.5">
            <SkeletonBlock className="h-3 w-56" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 max-mobile:items-start">
          <SkeletonBlock className="h-2.5 w-14" />
          <SkeletonBlock className="h-6 w-24" />
          <SkeletonPill className="h-6 w-16" />
        </div>
      </div>

      <hr className="my-6 border-t border-border" />

      <div className="grid grid-cols-3 gap-5 max-mobile:grid-cols-2 max-mobile:gap-4">
        {([null, null, "max-mobile:col-span-2"] as const).map((extra, i) => (
          <div key={i} className={`flex flex-col gap-2 ${extra ?? ""}`}>
            <SkeletonBlock className="h-2.5 w-14" />
            <SkeletonBlock className="h-3.5 w-4/5" />
            <SkeletonBlock className="h-3 w-11/12" />
          </div>
        ))}
      </div>

      <div className="mt-6 max-mobile:hidden">
        <div className="flex rounded-tl-nav-item rounded-tr-nav-item border-b border-border bg-background px-3.5 py-3">
          <SkeletonBlock className="h-2.5 w-16 flex-1" />
          <div className="flex gap-8">
            <SkeletonBlock className="h-2.5 w-8" />
            <SkeletonBlock className="h-2.5 w-10" />
            <SkeletonBlock className="h-2.5 w-10" />
          </div>
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center border-b border-border px-3.5 py-3.5">
            <SkeletonBlock className="h-3.5 w-40 flex-1" />
            <div className="flex gap-8">
              <SkeletonBlock className="h-3 w-8" />
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 min-mobile:hidden">
        <SkeletonBlock className="mb-2.5 h-2.5 w-12" />
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-border py-2.5">
            <SkeletonBlock className="h-3.5 w-40" />
            <SkeletonBlock className="h-3.5 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-6 min-mobile:flex min-mobile:justify-end">
        <div className="w-full min-mobile:max-w-65">
          <div className="flex items-center justify-between py-1">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
          <div className="flex items-center justify-between py-1">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
          <hr className="my-2 border-t border-border" />
          <div className="flex items-baseline justify-between">
            <SkeletonBlock className="h-3.5 w-12" />
            <SkeletonBlock className="h-5 w-24" />
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-nav-item bg-background px-4.5 py-3.5">
        <SkeletonBlock className="mx-auto h-3 w-2/5" />
      </div>
    </article>
  );
}

function SideColumnSkeleton() {
  return (
    <>
      <div className="max-mobile:hidden">
        <div className="overflow-hidden rounded-xl bg-card shadow-card">
          <div className="flex items-center border-b border-border px-6 py-4">
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <div className="flex flex-col gap-2.5 px-6 py-5">
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <SkeletonBlock className="h-11 w-full rounded-xl" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-9.5 w-full rounded-lg" />
              <SkeletonBlock className="h-9.5 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-card">
        <div className="flex items-center border-b border-border px-6 py-4">
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <ol className="px-6 py-1">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0"
            >
              <SkeletonBlock className="size-9 shrink-0 rounded-nav-item" />
              <div className="flex flex-1 flex-col gap-1.5">
                <SkeletonBlock className="h-3 w-3/5" />
                <SkeletonBlock className="h-2.5 w-2/5" />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        <div className="flex items-start gap-3">
          <SkeletonBlock className="size-10 shrink-0 rounded-nav-item" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-3.5 w-3/5" />
            <SkeletonBlock className="h-2.5 w-11/12" />
            <SkeletonBlock className="h-2.5 w-4/5" />
          </div>
        </div>
      </div>
    </>
  );
}

export function InvoiceDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <SkeletonTopbar titleW="w-20" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <SkeletonPageHeader back actions={2} titleW="w-30" />
        <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-5 max-tablet:grid-cols-1">
          <PreviewCardSkeleton />
          <div className="flex flex-col gap-5">
            <SideColumnSkeleton />
          </div>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 shadow-sheet min-mobile:hidden">
        <SkeletonBlock className="h-11 flex-1 rounded-lg" />
        <SkeletonBlock className="h-11 flex-1 rounded-lg" />
      </footer>
    </div>
  );
}
