import { Plus } from "@/components/icons"
import { PageHeader } from "@/components/ui/custom/page-header"
import { PillButton } from "@/components/ui/custom/pill-button"
import { ExportTrigger } from "@/components/invoices/export-trigger"

export function InvoicesPageHeader() {
  return (
    <PageHeader
      title="Invoices"
      subtitle="All your invoices in one place. Filter, sort, or open any one."
      actions={
        <>
          <ExportTrigger />
          <PillButton tone="primary" size="md">
            <Plus aria-hidden />
            New invoice
          </PillButton>
        </>
      }
    />
  )
}
