"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { Check, Download, Edit, WhatsApp } from "@/components/icons";
import { PillButton, pillButtonVariants } from "@/components/ui/custom/pill-button";
import { MarkPaidModal } from "@/components/ui/custom/mark-paid-modal";
import { invoiceEditHref } from "@/lib/invoice/invoice-detail-href";
import { cn } from "@/lib/utils";
import type { InvoiceDetail } from "@/lib/types/invoice";

interface InvoiceActionsOpenProps {
  invoice: InvoiceDetail;
  isOverdue: boolean;
  onSend: () => void;
}

export function InvoiceActionsOpen({ invoice, isOverdue, onSend }: InvoiceActionsOpenProps) {
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const markPaidTriggerRef = useRef<HTMLButtonElement>(null);
  const invoiceUuid = invoice.invoiceUuid ?? "";

  return (
    <>
      <PillButton
        ref={markPaidTriggerRef}
        type="button"
        tone="primary"
        size="md"
        className="w-full"
        onClick={() => setMarkPaidOpen(true)}
      >
        <Check strokeWidth={2.4} aria-hidden />
        Mark as paid
      </PillButton>
      <PillButton type="button" tone="whatsapp" size="md" className="w-full" onClick={onSend}>
        <WhatsApp aria-hidden />
        {isOverdue ? "Send nudge" : "Send reminder"}
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={invoiceEditHref(invoice)}
          aria-label="Edit invoice"
          className={cn(pillButtonVariants({ tone: "outline", size: "md" }))}
        >
          <Edit aria-hidden />
          Edit
        </Link>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>

      <MarkPaidModal
        invoice={invoice}
        invoiceUuid={invoiceUuid}
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
        finalFocus={markPaidTriggerRef}
      />
    </>
  );
}
