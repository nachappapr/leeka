import Link from "next/link";
import { ChevronRight } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { DashboardInvoicesShell } from "@/components/dashboard/dashboard-invoices-shell";
import { INVOICES } from "@/lib/constants";

export function InvoicesCard() {
  return (
    <Card
      title="Recent invoices"
      action={
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 rounded-sm text-body-sm font-bold text-coral-ink hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-ink focus-visible:ring-offset-2"
        >
          See all
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      }
    >
      <DashboardInvoicesShell invoices={INVOICES} />
    </Card>
  );
}
