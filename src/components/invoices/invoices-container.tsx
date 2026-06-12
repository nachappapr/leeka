import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { Card } from "@/components/ui/custom/card";
import { EmptyStateSwitch } from "@/components/ui/custom/empty-state-switch";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { InvoiceListActionsProvider } from "@/components/invoices/invoice-list-actions-provider";
import { InvoiceListActionsTrigger } from "@/components/invoices/invoice-list-actions-trigger";
import { InvoicesFilterShell } from "@/components/invoices/invoices-filter-shell";
import { InvoicesPageHeader } from "@/components/invoices/invoices-page-header";
import { INVOICES } from "@/lib/constants";

export function InvoicesContainer() {
  return (
    <InvoiceListActionsProvider invoices={INVOICES}>
      <div className="flex flex-1 flex-col">
        <Topbar
          title="Invoices"
          subtitle="All your invoices"
          actions={<InvoiceListActionsTrigger />}
          notificationsSlot={<TopbarNotifications />}
        />
        <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
          <EmptyStateSwitch
            empty={
              <>
                <InvoicesPageHeader />
                <Card>
                  <EmptyTableState
                    icon="Receipt"
                    title="No invoices yet"
                    body="Create your first invoice and we'll keep track of who's paid, who's viewed, and who needs a nudge."
                    primary={{ label: "Create invoice", href: "/invoices/new", icon: "Plus" }}
                  />
                </Card>
              </>
            }
            populated={<InvoicesFilterShell invoices={INVOICES} header={<InvoicesPageHeader />} />}
          />
        </div>
        <MobileTabBar />
      </div>
    </InvoiceListActionsProvider>
  );
}
