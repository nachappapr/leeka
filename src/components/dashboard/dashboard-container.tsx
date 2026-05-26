import { Download } from "@/components/icons";
import { ActivityCard } from "@/components/ui/custom/activity-card";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { MoneyAwaitedCard } from "@/components/ui/custom/money-awaited-card";
import { PillButton } from "@/components/ui/custom/pill-button";
import { Topbar } from "@/components/ui/custom/topbar";
import { HeroGrid } from "@/components/dashboard/hero-grid";
import { InvoicesCard } from "@/components/dashboard/invoices-card";
import { ACTIVITY_ITEMS, AGING_BUCKETS } from "@/lib/constants";

export function DashboardContainer() {
  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Dashboard" subtitle="Overview of your business" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-md:p-4 max-md:pb-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">
              Namaste, Raj 👋
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              Here&apos;s how your shop is doing today.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <PillButton tone="outline">
              <Download className="size-4" aria-hidden />
              Export
            </PillButton>
          </div>
        </div>

        <HeroGrid />
        <div className="grid grid-cols-[2fr_1fr] gap-5 max-lg:grid-cols-1">
          <InvoicesCard />
          <div className="flex flex-col gap-5">
            <ActivityCard items={ACTIVITY_ITEMS} />
            <MoneyAwaitedCard buckets={AGING_BUCKETS} />
          </div>
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}
