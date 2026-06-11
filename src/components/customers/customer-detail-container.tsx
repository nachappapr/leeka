import { notFound } from "next/navigation";

import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { CustomerDetailHeader } from "@/components/customers/customer-detail-header";
import { CustomerContactCard } from "@/components/customers/customer-contact-card";
import { CustomerStatTile } from "@/components/customers/customer-stat-tile";
import { CustomerInvoicesCard } from "@/components/customers/customer-invoices-card";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";
import type { Invoice } from "@/lib/types";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

interface CustomerDetailContainerProps {
  id: string;
}

const OPEN_STATUSES = ["sent", "viewed", "partial", "pending", "overdue"];

function formatRupees(rupees: number): string {
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export async function CustomerDetailContainer({ id }: CustomerDetailContainerProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  const businessId = member?.business_id;
  if (!businessId) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: customerRow } = await (supabase as any)
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!customerRow) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invoiceRows } = await (supabase as any)
    .from("invoices")
    .select("id, number, status, issue_date, total, amount_paid, customer_id")
    .eq("customer_id", id)
    .eq("business_id", businessId)
    .order("issue_date", { ascending: false });

  const rows = (invoiceRows ?? []) as Array<{
    id: string;
    number: string | null;
    status: string;
    issue_date: string;
    total: number;
    amount_paid: number;
    customer_id: string;
  }>;

  const outstandingRupees = rows
    .filter((r) => OPEN_STATUSES.includes(r.status))
    .reduce((sum, r) => sum + (r.total - r.amount_paid), 0);

  const totalBilledRupees = rows
    .filter((r) => r.status !== "cancelled")
    .reduce((sum, r) => sum + r.total, 0);

  const paidRupees = rows.reduce((sum, r) => sum + r.amount_paid, 0);

  const customerSince = customerRow.created_at
    ? new Date(customerRow.created_at).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : undefined;

  const customer: Customer = {
    id: customerRow.id,
    name: customerRow.name,
    phone: customerRow.phone ?? "",
    email: customerRow.email ?? undefined,
    gstin: customerRow.gstin ?? undefined,
    address: customerRow.billing_address ?? undefined,
    city: customerRow.city ?? undefined,
    invoiceCount: rows.length,
    totalBilled: formatRupees(totalBilledRupees),
    outstanding: outstandingRupees > 0 ? formatRupees(outstandingRupees) : null,
    paid: formatRupees(paidRupees),
    customerSince,
  };

  const invoices: Invoice[] = rows.map((r) => ({
    id: r.number ? `#${r.number}` : r.id,
    customer: customer.name,
    city: customer.city ?? "",
    isoDate: r.issue_date,
    amount: formatRupees(r.total),
    status: r.status as StatusPillStatus,
  }));

  const invoiceCount = invoices.length;
  const outstandingValue = outstandingRupees > 0 ? formatRupees(outstandingRupees) : "—";
  const outstandingTone = outstandingRupees > 0 ? ("overdue" as const) : ("ink-3" as const);
  const outstandingMeta = outstandingRupees > 0 ? "Across open invoices" : "All clear";
  const totalBilledMeta = `${invoiceCount} invoice${invoiceCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Customer" subtitle="Profile & invoices" />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <CustomerDetailHeader customer={customer} />

        {/* Two-column grid: 340px left rail + fluid right (collapses to 1-col ≤900px) */}
        {/* The min-[901px] arbitrary variant is approved per handoff spec (layout breakpoint) */}
        <div className="grid grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[340px_minmax(0,1fr)]">
          <CustomerContactCard customer={customer} />

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 max-mobile:grid-cols-1">
              <CustomerStatTile
                label="Total billed"
                value={customer.totalBilled}
                meta={totalBilledMeta}
                tone="ink"
              />
              <CustomerStatTile
                label="Paid"
                value={customer.paid ?? "₹0"}
                meta="Lifetime"
                tone="paid"
              />
              <CustomerStatTile
                label="Outstanding"
                value={outstandingValue}
                meta={outstandingMeta}
                tone={outstandingTone}
              />
            </div>

            <CustomerInvoicesCard customerName={customer.name} invoices={invoices} />
          </div>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
