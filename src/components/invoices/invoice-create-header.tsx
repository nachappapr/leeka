import { PageHeader } from "@/components/ui/custom/page-header"

export function InvoiceCreateHeader() {
  return (
    <PageHeader
      backHref="/invoices"
      backLabel="Back to invoices"
      title="Create invoice"
      subtitle="Fill in the details — we'll generate the PDF and you can send on WhatsApp."
    />
  )
}
