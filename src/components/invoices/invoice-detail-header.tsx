import Link from "next/link"

import { ChevronLeft, Download, Share } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { formatInvoiceDate } from "@/lib/utils"

interface InvoiceDetailHeaderProps {
  invoiceId: string
  customer: string
  isoDate: string
}

export function InvoiceDetailHeader({
  invoiceId,
  customer,
  isoDate,
}: InvoiceDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 max-mobile:flex-col">
      <div className="flex items-center gap-3">
        <Link
          href="/invoices"
          aria-label="Back to invoices"
          className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink-2 transition-colors hover:border-line-strong hover:bg-coral/5 hover:text-coral-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div className="min-w-0">
          <h2 className="truncate text-26 font-black tracking-snug text-ink max-mobile:text-title">
            {invoiceId}
          </h2>
          <p className="text-body-sm font-medium text-ink-3">
            Issued{" "}
            <time dateTime={isoDate}>{formatInvoiceDate(isoDate)}</time>
            {" · "}
            {customer}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 max-mobile:hidden">
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
        <PillButton tone="outline" size="md">
          <Share aria-hidden />
          Share
        </PillButton>
      </div>
    </div>
  )
}
