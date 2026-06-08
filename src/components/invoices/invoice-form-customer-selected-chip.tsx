// No "use client": purely presentational — takes onClear as a prop, owns no hooks.
// Rides the client boundary of the parent (InvoiceFormCustomerPicker).

import { Edit } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import type { SelectedCustomer } from "@/lib/types/customer"

import { InvoiceFormCustomerAvatar } from "./invoice-form-customer-avatar"

export function InvoiceFormCustomerSelectedChip({
  value,
  onClear,
}: {
  value: SelectedCustomer
  onClear: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-coral/20 bg-coral-soft px-3.5 py-3">
      <InvoiceFormCustomerAvatar name={value.name} sizePx={44} />
      <div className="min-w-0 flex-1">
        <div className="text-body font-extrabold text-ink">{value.name}</div>
        <div className="mt-px text-label text-ink-2">
          {value.phone}
          {value.last ? ` · ${value.last}` : ""}
        </div>
      </div>
      <PillButton tone="ghost" size="sm" onClick={onClear} type="button">
        <Edit className="size-3.5" aria-hidden />
        Change
      </PillButton>
    </div>
  )
}
