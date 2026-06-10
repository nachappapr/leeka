import { notFound } from "next/navigation";

import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { CustomerDetailHeader } from "@/components/customers/customer-detail-header";
import { CustomerContactCard } from "@/components/customers/customer-contact-card";
import { CustomerStatTile } from "@/components/customers/customer-stat-tile";
import { CustomerInvoicesCard } from "@/components/customers/customer-invoices-card";
import { findCustomer, customerInvoiceSummary } from "@/lib/constants";

interface CustomerDetailContainerProps {
  id: string;
}

function parseAmount(s: string | null | undefined): number {
  if (!s) return 0;
  return parseInt(s.replace(/[₹,]/g, ""), 10) || 0;
}

export function CustomerDetailContainer({ id }: CustomerDetailContainerProps) {
  const customer = findCustomer(id);
  if (!customer) notFound();

  const summary = customerInvoiceSummary(customer.name);
  const invoiceCount = summary.invoices.length;

  const paid = customer.paid ?? "₹0";

  const outstandingAmount = parseAmount(summary.outstanding);
  const outstandingValue = outstandingAmount > 0 ? (summary.outstanding ?? "—") : "—";
  const outstandingTone = outstandingAmount > 0 ? ("overdue" as const) : ("ink-3" as const);
  const outstandingMeta = outstandingAmount > 0 ? "Across open invoices" : "All clear";

  const totalBilledMeta = `${invoiceCount} invoice${invoiceCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Customer" subtitle="Profile & invoices" />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <CustomerDetailHeader customer={customer} />

        {/* Two-column grid: 340px left rail + fluid right (collapses to 1-col ≤900px) */}
        {/* The min-[901px] arbitrary variant is approved per handoff spec (layout breakpoint) */}
        <div className="grid grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[340px_minmax(0,1fr)]">
          {/* Left rail — contact card */}
          <CustomerContactCard customer={customer} />

          {/* Right column — stats + invoices */}
          <div className="flex flex-col gap-4">
            {/* Stat tiles — 3-up desktop, 1-col mobile */}
            <div className="grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
              <CustomerStatTile
                label="Total billed"
                value={summary.totalBilled}
                meta={totalBilledMeta}
                tone="ink"
              />
              <CustomerStatTile label="Paid" value={paid} meta="Lifetime" tone="paid" />
              <CustomerStatTile
                label="Outstanding"
                value={outstandingValue}
                meta={outstandingMeta}
                tone={outstandingTone}
              />
            </div>

            {/* Invoices card */}
            <CustomerInvoicesCard customerName={customer.name} invoices={summary.invoices} />
          </div>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
