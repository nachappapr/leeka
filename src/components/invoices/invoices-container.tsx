import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { InvoiceListActionsTrigger } from "@/components/invoices/invoice-list-actions-trigger";
import { InvoicesListClient } from "@/components/invoices/invoices-list-client";
import { listInvoicesPage, getInvoiceStatusCounts, resolveBusinessId } from "@/lib/data/invoice";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/plan/plan.server";
import { INVOICES_FILTER_CHIPS } from "@/lib/constants/invoices";
import type { InvoiceStatusFilter } from "@/lib/types/invoice";

interface InvoicesContainerProps {
  initialFilter?: string;
}

export async function InvoicesContainer({ initialFilter }: InvoicesContainerProps) {
  const validatedFilter: InvoiceStatusFilter = INVOICES_FILTER_CHIPS.some(
    (chip) => chip.id === initialFilter,
  )
    ? (initialFilter as InvoiceStatusFilter)
    : "all";

  const supabase = await createClient();
  const businessId = await resolveBusinessId(supabase);

  const [initialPage, statusCounts, isProPlan] = businessId
    ? await Promise.all([
        listInvoicesPage({ businessId, status: validatedFilter, cursor: null, limit: 25 }),
        getInvoiceStatusCounts(),
        isPro(businessId),
      ])
    : [{ rows: [], nextCursor: null }, {}, false];

  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title="Invoices"
        subtitle="All your invoices"
        actions={<InvoiceListActionsTrigger />}
        notificationsSlot={<TopbarNotifications />}
      />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <InvoicesListClient
          initialRows={initialPage.rows}
          initialNextCursor={initialPage.nextCursor}
          initialFilter={validatedFilter}
          statusCounts={statusCounts}
          isProUser={isProPlan}
        />
      </div>
      <MobileTabBar />
    </div>
  );
}
