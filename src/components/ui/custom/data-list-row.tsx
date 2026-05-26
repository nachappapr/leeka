import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import { StatusPill } from "@/components/ui/custom/status-pill"
import type { Invoice } from "@/lib/types"
import { formatInvoiceDate } from "@/lib/utils"

export interface DataListRowProps {
  invoice: Invoice
}

export function DataListRow({ invoice }: DataListRowProps) {
  const initials = invoice.customer
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)

  return (
    <li className="cursor-pointer rounded-2xl bg-card shadow-card hover:bg-coral/5 active:bg-coral/5">
      <div className="flex items-center gap-3 p-4">
        <Avatar className="size-11 bg-coral-soft">
          <AvatarFallback className="bg-coral-soft text-body-sm font-bold text-coral-ink">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-body font-bold text-ink">
            {invoice.customer}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-label text-ink-3">
            <span>{invoice.id}</span>
            <span aria-hidden>·</span>
            <time dateTime={invoice.isoDate}>
              {formatInvoiceDate(invoice.isoDate)}
            </time>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-ink-2">Status</span>
          <StatusPill status={invoice.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm text-ink-2">Amount</span>
          <span className="tabular text-body font-bold text-ink">
            {invoice.amount}
          </span>
        </div>
      </div>
    </li>
  )
}
