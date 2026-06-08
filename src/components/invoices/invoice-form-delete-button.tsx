"use client"

// Justified "use client": fires brandToast (client-only Sonner call).

import { Trash2 } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { brandToast } from "@/components/ui/custom/brand-toast"

interface InvoiceFormDeleteButtonProps {
  onDelete: () => void
}

export function fireDeleteInvoiceToast(invoiceId: string, onConfirm: () => void) {
  brandToast.warn({
    title: "Delete this invoice?",
    sub: `${invoiceId} · This can’t be undone.`,
    duration: Infinity,
    actions: [
      {
        label: "Delete",
        primary: true,
        icon: <Trash2 className="size-3.5" aria-hidden />,
        onClick: onConfirm,
      },
      {
        label: "Cancel",
      },
    ],
  })
}

export function InvoiceFormDeleteButton({ onDelete }: InvoiceFormDeleteButtonProps) {
  return (
    <PillButton
      tone="ghostDanger"
      type="button"
      onClick={onDelete}
    >
      <Trash2 aria-hidden />
      Delete invoice
    </PillButton>
  )
}
