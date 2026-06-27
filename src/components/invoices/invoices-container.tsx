import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
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
        getInvoiceStatusCounts({ businessId }),
        isPro(businessId),
      ])
    : [{ rows: [], nextCursor: null }, {}, false];

  return (
    <InvoicesListClient
      initialRows={initialPage.rows}
      initialNextCursor={initialPage.nextCursor}
      initialFilter={validatedFilter}
      statusCounts={statusCounts}
      isProUser={isProPlan}
      notificationsSlot={<TopbarNotifications />}
    />
  );
}
