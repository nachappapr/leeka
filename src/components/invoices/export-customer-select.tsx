"use client"

import { Users, ChevronDownIcon } from "@/components/icons"

interface ExportCustomerSelectProps {
  customer: string
  setCustomer: (v: string) => void
  uniqueCustomers: string[]
}

export function ExportCustomerSelect({
  customer,
  setCustomer,
  uniqueCustomers,
}: ExportCustomerSelectProps) {
  return (
    <div className="relative flex items-center gap-2.5 px-3.5 h-11 bg-card border border-line-strong rounded-xl transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(244,106,57,0.15)]">
      <Users size={16} aria-hidden className="text-ink-3 shrink-0" />
      <select
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
        aria-label="Filter by customer"
        className="flex-1 appearance-none border-0 bg-transparent text-body font-semibold text-ink outline-none cursor-pointer min-w-0 py-0"
      >
        <option value="all">All customers ({uniqueCustomers.length})</option>
        {uniqueCustomers.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        size={16}
        aria-hidden
        className="text-ink-3 shrink-0 pointer-events-none"
      />
    </div>
  )
}
