import { notFound } from "next/navigation"

import { Topbar } from "@/components/ui/custom/topbar"
import { findInvoiceDetail } from "@/lib/constants"

import { InvoiceEditForm } from "./invoice-edit-form"
import { InvoiceEditHeader } from "./invoice-edit-header"
import { InvoiceEditMobileFooter } from "./invoice-edit-mobile-footer"

interface InvoiceEditContainerProps {
  id: string
}

export function InvoiceEditContainer({ id }: InvoiceEditContainerProps) {
  const invoice = findInvoiceDetail(id)
  if (!invoice) notFound()

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Edit invoice" subtitle={invoice.id} />
      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-4 max-mobile:p-4 max-mobile:pb-24">
        <InvoiceEditHeader id={id} customer={invoice.customer} />
        <InvoiceEditForm invoice={invoice} />
      </div>
      <InvoiceEditMobileFooter />
    </div>
  )
}
