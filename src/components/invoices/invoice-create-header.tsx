import { Edit } from "@/components/icons"
import { PageHeader } from "@/components/ui/custom/page-header"
import { StatusPill } from "@/components/ui/custom/status-pill"

export function InvoiceCreateHeader() {
  return (
    <PageHeader
      backHref="/invoices"
      backLabel="Back to invoices"
      title="Create invoice"
      subtitle="Fill in the details — your customer sees the live preview on the right."
      actions={
        <StatusPill status="draft" className="self-start before:hidden">
          <Edit className="size-2.75" aria-hidden />
          {" "}DRAFT
        </StatusPill>
      }
    />
  )
}
