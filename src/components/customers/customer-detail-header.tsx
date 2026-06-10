import Link from "next/link";

import { ChevronLeft, Plus } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { CustomerEditTrigger } from "@/components/customers/customer-edit-trigger";
import type { Customer } from "@/lib/types";

interface CustomerDetailHeaderProps {
  customer: Customer;
}

// Custom header (not PageHeader) so the actions can stack onto their own
// full-width row below the title on mobile — PageHeader keeps them inline.
export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const subtitle = customer.gstin ? `${customer.phone} · GSTIN ${customer.gstin}` : customer.phone;

  return (
    <header className="flex items-start justify-between gap-4 max-mobile:flex-col max-mobile:gap-3">
      {/* Left: back button + title/subtitle */}
      <div className="flex min-w-0 items-center gap-3 max-mobile:w-full">
        <Link
          href="/customers"
          aria-label="Back to customers"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-ink-2 transition-colors hover:border-line-strong hover:bg-coral/5 hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h2 className="text-h2 font-extrabold break-words text-ink">{customer.name}</h2>
          {subtitle && (
            <p className="mt-0.5 text-body-sm font-medium break-words text-ink-3">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: actions — inline on desktop; on mobile they wrap to their own
          full-width row beneath the title, with labels shown (room to spare). */}
      <div className="flex shrink-0 items-center gap-2 max-mobile:w-full">
        <PillButton
          tone="outline"
          size="md"
          render={<Link href="/invoices/new" />}
          aria-label="New invoice"
          className="max-mobile:flex-1"
        >
          <Plus aria-hidden />
          <span>New invoice</span>
        </PillButton>
        <CustomerEditTrigger customer={customer} className="max-mobile:flex-1" />
      </div>
    </header>
  );
}
