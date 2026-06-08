import Link from "next/link"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import type { Customer } from "@/lib/types"

interface CustomersMobileListProps {
  customers: ReadonlyArray<Customer>
}

export function CustomersMobileList({ customers }: CustomersMobileListProps) {
  return (
    <ul aria-label="Customers" className="flex flex-col gap-3 min-mobile:hidden">
      {customers.map((cust) => {
        const initials = cust.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)

        return (
          <li key={cust.id}>
            <Link
              href={`/customers/${cust.id}`}
              className="block cursor-pointer rounded-2xl bg-card shadow-card hover:bg-coral/5 active:bg-coral/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
            >
              <div className="flex items-center gap-3 p-4">
                <Avatar className="size-11 bg-coral-soft">
                  <AvatarFallback className="bg-coral-soft text-body-sm font-bold text-coral-ink">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-bold text-ink">{cust.name}</div>
                  <div className="mt-0.5 text-label text-ink-3">{cust.phone}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-ink-2">Invoices</span>
                  <span className="text-body-sm font-medium text-ink">
                    {cust.invoiceCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-ink-2">Total Billed</span>
                  <span className="tabular text-body font-bold text-ink">
                    {cust.totalBilled}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-ink-2">Outstanding</span>
                  <span
                    className={cn(
                      "tabular text-body font-bold",
                      cust.outstanding ? "text-coral" : "text-ink-3",
                    )}
                  >
                    {cust.outstanding ?? "—"}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
