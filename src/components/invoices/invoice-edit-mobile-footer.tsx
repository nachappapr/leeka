"use client"

import { WhatsApp } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"

export function InvoiceEditMobileFooter() {
  return (
    <footer
      aria-label="Invoice actions"
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
    >
      <PillButton tone="outline" size="md" className="flex-1 rounded-lg!" type="button">
        Save as draft
      </PillButton>
      <PillButton tone="whatsapp" size="md" className="flex-1 rounded-lg!" type="button">
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
    </footer>
  )
}
