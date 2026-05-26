import { Download, Plus } from "@/components/icons"
import { PageHeader } from "@/components/ui/custom/page-header"
import { PillButton } from "@/components/ui/custom/pill-button"

export function InvoicesPageHeader() {
  return (
    <PageHeader
      title="Invoices"
      subtitle="All your invoices in one place. Filter, sort, or open any one."
      actions={
        <>
          <PillButton tone="outline" size="md">
            <Download aria-hidden />
            Export CSV
          </PillButton>
          <PillButton tone="primary" size="md">
            <Plus aria-hidden />
            New invoice
          </PillButton>
        </>
      }
    />
  )
}
