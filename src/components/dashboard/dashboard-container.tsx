import { ActivityCard } from "@/components/ui/custom/activity-card";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { MoneyAwaitedCard } from "@/components/ui/custom/money-awaited-card";
import { Topbar } from "@/components/ui/custom/topbar";
import { EmptyStateSwitch } from "@/components/ui/custom/empty-state-switch";
import { InvoiceListActionsProvider } from "@/components/invoices/invoice-list-actions-provider";
import { InvoiceListActionsTrigger } from "@/components/invoices/invoice-list-actions-trigger";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { HeroGrid } from "@/components/dashboard/hero-grid";
import { InvoicesCard } from "@/components/dashboard/invoices-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { ACTIVITY_ITEMS, AGING_BUCKETS } from "@/lib/constants";
import { INVOICES } from "@/lib/constants/invoices";

function PopulatedDashboard() {
  return (
    <div className="flex flex-col gap-5 max-mobile:gap-3.5">
      <DashboardGreeting />
      <HeroGrid />
      <div className="grid grid-cols-[2fr_1fr] gap-5 max-tablet:grid-cols-1 max-mobile:gap-3.5">
        <InvoicesCard />
        <div className="flex flex-col gap-5">
          <ActivityCard items={ACTIVITY_ITEMS} />
          <MoneyAwaitedCard buckets={AGING_BUCKETS} />
        </div>
      </div>
    </div>
  );
}

export function DashboardContainer() {
  return (
    <InvoiceListActionsProvider invoices={INVOICES}>
      <div className="flex flex-1 flex-col">
        <Topbar
          title="Dashboard"
          subtitle="Overview of your business"
          actions={<InvoiceListActionsTrigger />}
        />
        <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
          <EmptyStateSwitch empty={<EmptyDashboard />} populated={<PopulatedDashboard />} />
        </div>
        <MobileTabBar />
      </div>
    </InvoiceListActionsProvider>
  );
}
