import Link from "next/link"

import { Check, Download, Edit, WhatsApp } from "@/components/icons"
import { PillButton, pillButtonVariants } from "@/components/ui/custom/pill-button"
import { cn } from "@/lib/utils"

interface InvoiceActionsDraftProps {
  invoiceId: string
  onSend: () => void
}

export function InvoiceActionsDraft({ invoiceId, onSend }: InvoiceActionsDraftProps) {
  return (
    <>
      <PillButton tone="primary" size="md" className="w-full">
        <Check strokeWidth={2.4} aria-hidden />
        Send invoice
      </PillButton>
      <PillButton type="button" tone="whatsapp" size="md" className="w-full" onClick={onSend}>
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/invoices/${invoiceId.replace("#", "")}/edit`}
          aria-label="Edit invoice"
          className={cn(pillButtonVariants({ tone: "outline", size: "md" }), "w-full")}
        >
          <Edit aria-hidden />
          Edit
        </Link>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
    </>
  )
}
