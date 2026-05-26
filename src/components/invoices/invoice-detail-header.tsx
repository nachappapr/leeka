import { Download, Share } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { PageHeader } from "@/components/ui/custom/page-header"
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
    <PageHeader
      backHref="/invoices"
      backLabel="Back to invoices"
      title={invoiceId}
      subtitle={`Issued ${formatInvoiceDate(isoDate)} · ${customer}`}
      actions={
        <>
          <PillButton tone="outline" size="md">
            <Download aria-hidden />
            PDF
          </PillButton>
          <PillButton tone="outline" size="md">
            <Share aria-hidden />
            Share
          </PillButton>
        </>
      }
    />
  )
}
