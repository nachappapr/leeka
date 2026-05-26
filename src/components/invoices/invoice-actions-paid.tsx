import { Check, Clock, Download, WhatsApp } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"

export function InvoiceActionsPaid() {
  return (
    <>
      <div className="flex items-center gap-2.5 rounded-md bg-paid-soft px-4 py-3.5 text-body-sm font-bold text-paid-ink">
        <Check className="size-4.5" strokeWidth={2.6} aria-hidden />
        Paid in full
      </div>
      <PillButton tone="whatsapp" size="md" className="w-full">
        <WhatsApp aria-hidden />
        Send receipt
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <PillButton tone="outline" size="md">
          <Clock aria-hidden />
          Mark unpaid
        </PillButton>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
    </>
  )
}
