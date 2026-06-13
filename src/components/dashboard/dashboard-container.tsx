import { ActivityCard } from "@/components/ui/custom/activity-card";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { MoneyAwaitedCard } from "@/components/ui/custom/money-awaited-card";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { EmptyStateSwitch } from "@/components/ui/custom/empty-state-switch";
import { InvoiceListActionsProvider } from "@/components/invoices/invoice-list-actions-provider";
import { InvoiceListActionsTrigger } from "@/components/invoices/invoice-list-actions-trigger";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { HeroGrid } from "@/components/dashboard/hero-grid";
import { InvoicesCard } from "@/components/dashboard/invoices-card";
import { EmptyDashboard } from "@/components/dashboard/empty-dashboard";
import { ACTIVITY_ITEMS, AGING_BUCKETS } from "@/lib/constants";
import { getDashboardSummary, getRecentInvoices } from "@/lib/data/dashboard";
import { isPro } from "@/lib/plan/plan.server";
import type { Invoice } from "@/lib/types";
import type { DashboardSummary } from "@/lib/types/dashboard";

interface PopulatedDashboardProps {
  summary: DashboardSummary;
  invoices: ReadonlyArray<Invoice>;
}

function PopulatedDashboard({ summary, invoices }: PopulatedDashboardProps) {
  return (
    <div className="flex flex-col gap-5 max-mobile:gap-3.5">
      <DashboardGreeting />
      <HeroGrid summary={summary} />
      <div className="grid grid-cols-[2fr_1fr] gap-5 max-tablet:grid-cols-1 max-mobile:gap-3.5">
        <InvoicesCard invoices={invoices} />
        <div className="flex flex-col gap-5">
          <ActivityCard items={ACTIVITY_ITEMS} />
          <MoneyAwaitedCard buckets={AGING_BUCKETS} />
        </div>
      </div>
    </div>
  );
}

export async function DashboardContainer() {
  const [summary, invoices, isProPlan] = await Promise.all([
    getDashboardSummary(),
    getRecentInvoices(),
    isPro(),
  ]);

  const hasInvoices = invoices.length > 0;

  return (
    <InvoiceListActionsProvider
      invoices={invoices}
      desktopFilter="all"
      onDesktopFilterChange={() => {}}
      isProUser={isProPlan}
    >
      <div className="flex flex-1 flex-col">
        <Topbar
          title="Dashboard"
          subtitle="Overview of your business"
          notificationsSlot={<TopbarNotifications />}
          actions={<InvoiceListActionsTrigger />}
        />
        <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
          {hasInvoices ? (
            <EmptyStateSwitch
              empty={<EmptyDashboard />}
              populated={<PopulatedDashboard summary={summary} invoices={invoices} />}
            />
          ) : (
            <EmptyDashboard />
          )}
        </div>
        <MobileTabBar />
      </div>
    </InvoiceListActionsProvider>
  );
}
