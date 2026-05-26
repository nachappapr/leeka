import { Topbar } from "@/components/ui/custom/topbar"

import { InvoiceCreateForm } from "./invoice-create-form"
import { InvoiceCreateHeader } from "./invoice-create-header"
import { InvoiceEditMobileFooter } from "./invoice-edit-mobile-footer"

export function InvoiceCreateContainer() {
  const today = new Date()
  const due = new Date(today)
  due.setDate(due.getDate() + 30)

  const isoDate = today.toISOString().split("T")[0]
  const dueIsoDate = due.toISOString().split("T")[0]

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Create invoice" />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceCreateHeader />
        <InvoiceCreateForm isoDate={isoDate} dueIsoDate={dueIsoDate} />
      </div>
      <InvoiceEditMobileFooter />
    </div>
  )
}
