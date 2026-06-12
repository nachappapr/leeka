"use client";

import { useState } from "react";
import Link from "next/link";

import { Bell, Check, Edit, WhatsApp } from "@/components/icons";
import { PillButton, pillButtonVariants } from "@/components/ui/custom/pill-button";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";
import { InvoiceDetailMobileSheet } from "./invoice-detail-mobile-sheet";
import { ReminderChannelsModal } from "./reminder-channels-modal";

interface InvoiceDetailMobileFooterProps {
  invoice: Invoice;
}

// Sticky bottom action bar on mobile. Sits directly at the bottom of the
// viewport — MobileTabBar is removed from invoice detail pages.
export function InvoiceDetailMobileFooter({ invoice }: InvoiceDetailMobileFooterProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const invoiceId = invoice.id;
  const status = invoice.status;
  const isPaid = status === "paid";
  const isDraft = status === "draft";

  if (isPaid) {
    return (
      <footer
        aria-label="Invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <PillButton
          type="button"
          tone="whatsapp"
          size="md"
          className="flex-1 rounded-lg!"
          onClick={() => setSendOpen(true)}
        >
          <WhatsApp aria-hidden />
          Send receipt
        </PillButton>
        <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
        <SendChannelsModal
          invoice={invoice}
          invoiceUuid={invoice.invoiceUuid ?? ""}
          open={sendOpen}
          onOpenChange={setSendOpen}
        />
      </footer>
    );
  }

  if (isDraft) {
    return (
      <footer
        aria-label="Invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <Link
          href={`/invoices/${invoiceId.replace("#", "")}/edit`}
          aria-label="Edit invoice"
          className={cn(pillButtonVariants({ tone: "outline", size: "md" }), "flex-1 rounded-lg!")}
        >
          <Edit aria-hidden />
          Edit
        </Link>
        <PillButton tone="primary" size="md" className="flex-1 rounded-lg!">
          <Check strokeWidth={2.4} aria-hidden />
          Send invoice
        </PillButton>
        <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
      </footer>
    );
  }

  return (
    <footer
      aria-label="Invoice actions"
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
    >
      <PillButton
        type="button"
        tone="outline"
        size="md"
        className="flex-1 rounded-lg!"
        onClick={() => setReminderOpen(true)}
      >
        <Bell aria-hidden />
        Remind
      </PillButton>
      <PillButton tone="primary" size="md" className="flex-1 rounded-lg!">
        <Check strokeWidth={2.4} aria-hidden />
        Mark paid
      </PillButton>
      <InvoiceDetailMobileSheet invoiceId={invoiceId} status={status} />
      <ReminderChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={reminderOpen}
        onOpenChange={setReminderOpen}
      />
    </footer>
  );
}
