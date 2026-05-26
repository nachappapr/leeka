import { Card } from "@/components/ui/custom/card"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"
import { InvoiceActionsDraft } from "./invoice-actions-draft"
import { InvoiceActionsOpen } from "./invoice-actions-open"
import { InvoiceActionsPaid } from "./invoice-actions-paid"

interface InvoiceActionsCardProps {
  status: StatusPillStatus
}

export function InvoiceActionsCard({ status }: InvoiceActionsCardProps) {
  const isPaid = status === "paid"
  const isDraft = status === "draft"
  const isOverdue = status === "overdue"

  return (
    <Card title="Actions" headingLevel={3}>
      <div className="flex flex-col gap-2.5 px-6 py-5">
        {isPaid ? (
          <InvoiceActionsPaid />
        ) : isDraft ? (
          <InvoiceActionsDraft />
        ) : (
          <InvoiceActionsOpen isOverdue={isOverdue} />
        )}
      </div>
    </Card>
  )
}
