import { PageHeader } from "@/components/ui/custom/page-header"

interface InvoiceEditHeaderProps {
  id: string
  customer: string
}

export function InvoiceEditHeader({ id, customer }: InvoiceEditHeaderProps) {
  return (
    <PageHeader
      backHref={`/invoices/${id}`}
      backLabel="Back to invoice"
      title="Edit invoice"
      subtitle={`#${id} · ${customer}`}
    />
  )
}
