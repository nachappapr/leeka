"use client";

import { useRef, useState } from "react";
import { Check, Clock, Download } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { MarkUnpaidModal } from "@/components/ui/custom/mark-unpaid-modal";
import { WhatsApp } from "@/components/icons";
import type { InvoiceDetail } from "@/lib/types/invoice";

interface InvoiceActionsPaidProps {
  invoice: InvoiceDetail;
  onSend: () => void;
}

export function InvoiceActionsPaid({ invoice, onSend }: InvoiceActionsPaidProps) {
  const [markUnpaidOpen, setMarkUnpaidOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const invoiceUuid = invoice.invoiceUuid ?? "";

  return (
    <>
      <div className="flex items-center gap-2.5 rounded-md bg-paid-soft px-4 py-3.5 text-body-sm font-bold text-paid-ink">
        <Check className="size-4.5" strokeWidth={2.6} aria-hidden />
        Paid in full
      </div>
      <PillButton type="button" tone="whatsapp" size="md" className="w-full" onClick={onSend}>
        <WhatsApp aria-hidden />
        Send receipt
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        {invoice.reversible ? (
          <PillButton
            ref={triggerRef}
            type="button"
            tone="outline"
            size="md"
            onClick={() => setMarkUnpaidOpen(true)}
          >
            <Clock aria-hidden />
            Mark unpaid
          </PillButton>
        ) : (
          <div className="flex flex-col gap-1">
            <PillButton
              type="button"
              tone="outline"
              size="md"
              disabled
              focusableWhenDisabled
              aria-describedby="mark-unpaid-hint"
              className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            >
              <Clock aria-hidden />
              Mark unpaid
            </PillButton>
            <p id="mark-unpaid-hint" className="text-label text-ink-3">
              Gateway-confirmed payments can&apos;t be undone here
            </p>
          </div>
        )}
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>

      <MarkUnpaidModal
        invoice={invoice}
        invoiceUuid={invoiceUuid}
        destination={invoice.unpaidDestination}
        open={markUnpaidOpen}
        onOpenChange={setMarkUnpaidOpen}
        finalFocus={triggerRef}
      />
    </>
  );
}
