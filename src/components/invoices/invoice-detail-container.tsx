import { notFound } from "next/navigation"

import { Topbar } from "@/components/ui/custom/topbar"
import { InvoiceActionsCard } from "@/components/invoices/invoice-actions-card"
import { InvoiceActivityCard } from "@/components/invoices/invoice-activity-card"
import { InvoiceDetailHeader } from "@/components/invoices/invoice-detail-header"
import { InvoiceDetailMobileFooter } from "@/components/invoices/invoice-detail-mobile-footer"
import { InvoicePreviewCard } from "@/components/invoices/invoice-preview-card"
import { InvoiceStatusTipCard } from "@/components/invoices/invoice-status-tip-card"
import { findInvoiceDetail } from "@/lib/constants"

interface InvoiceDetailContainerProps {
  id: string
}

export function InvoiceDetailContainer({ id }: InvoiceDetailContainerProps) {
  const invoice = findInvoiceDetail(id)
  if (!invoice) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Invoice" subtitle={invoice.id} />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceDetailHeader
          invoiceId={invoice.id}
          customer={invoice.customer}
          isoDate={invoice.isoDate}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-5 max-tablet:grid-cols-1">
          <InvoicePreviewCard invoice={invoice} />

          <div className="flex flex-col gap-5">
            <div className="max-mobile:hidden">
              <InvoiceActionsCard status={invoice.status} invoiceId={invoice.id} />
            </div>
            <InvoiceActivityCard />
            <InvoiceStatusTipCard status={invoice.status} />
          </div>
        </div>
      </div>

      <InvoiceDetailMobileFooter invoiceId={invoice.id} status={invoice.status} />
    </div>
  )
}
