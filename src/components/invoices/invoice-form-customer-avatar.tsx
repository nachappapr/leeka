// No "use client": purely presentational — no hooks, no state.
// Rides the client boundary of the parent (InvoiceFormCustomerSearchCombobox /
// InvoiceFormCustomerComboboxDropdown) that owns state.

import { cn } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/primitives/avatar"

// ── Private helper ─────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

// ── Export ─────────────────────────────────────────────────────────────────

export function InvoiceFormCustomerAvatar({
  name,
  sizePx,
}: {
  name: string
  sizePx: 44 | 32
}) {
  return (
    <Avatar
      className={cn(
        "shrink-0 bg-coral-soft",
        sizePx === 44 ? "size-11" : "size-8",
      )}
    >
      <AvatarFallback
        className={cn(
          "bg-coral-soft text-coral-ink font-bold",
          sizePx === 44 ? "text-body-sm" : "text-label",
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
