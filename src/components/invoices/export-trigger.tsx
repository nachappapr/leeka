"use client"

import { useState } from "react"

import { Download } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { ExportInvoicesModal } from "@/components/invoices/export-invoices-modal"
import { INVOICES } from "@/lib/constants/invoices"

export function ExportTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <PillButton
        tone="outline"
        size="md"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Download aria-hidden />
        Export
      </PillButton>
      <ExportInvoicesModal
        open={open}
        onClose={() => setOpen(false)}
        invoices={INVOICES}
      />
    </>
  )
}
