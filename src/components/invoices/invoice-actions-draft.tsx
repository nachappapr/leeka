import { Check, Download, Edit, WhatsApp } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"

export function InvoiceActionsDraft() {
  return (
    <>
      <PillButton tone="primary" size="lg" className="w-full">
        <Check strokeWidth={2.4} aria-hidden />
        Send invoice
      </PillButton>
      <PillButton tone="whatsapp" size="md" className="w-full">
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <PillButton tone="outline" size="md">
          <Edit aria-hidden />
          Edit
        </PillButton>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
    </>
  )
}
