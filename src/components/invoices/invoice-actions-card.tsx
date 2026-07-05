"use client";

import { useState } from "react";

import { Card } from "@/components/ui/custom/card";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import type { InvoiceDetail } from "@/lib/types/invoice";
import { InvoiceActionsCancelled } from "./invoice-actions-cancelled";
import { InvoiceActionsDraft } from "./invoice-actions-draft";
import { InvoiceActionsOpen } from "./invoice-actions-open";
import { InvoiceActionsPaid } from "./invoice-actions-paid";
import { ReceiptChannelsModal } from "./receipt-channels-modal";
import { ReminderChannelsModal } from "./reminder-channels-modal";

interface InvoiceActionsCardProps {
  invoice: InvoiceDetail;
}

export function InvoiceActionsCard({ invoice }: InvoiceActionsCardProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const status = invoice.status;
  const invoiceId = invoice.id;
  const isPaid = status === "paid";
  const isDraft = status === "draft";
  const isCancelled = status === "cancelled";
  const isOverdue = status === "overdue";

  return (
    <>
      <Card title="Actions" headingLevel={3}>
        <div className="flex flex-col gap-2.5 px-6 py-5">
          {isCancelled ? (
            <InvoiceActionsCancelled />
          ) : isPaid ? (
            <InvoiceActionsPaid invoice={invoice} onSend={() => setReceiptOpen(true)} />
          ) : isDraft ? (
            <InvoiceActionsDraft
              invoiceId={invoiceId}
              invoiceUuid={invoice.invoiceUuid ?? ""}
              onSend={() => setSendOpen(true)}
            />
          ) : (
            <InvoiceActionsOpen
              invoice={invoice}
              isOverdue={isOverdue}
              onSend={() => setReminderOpen(true)}
            />
          )}
        </div>
      </Card>
      <SendChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />
      <ReminderChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={reminderOpen}
        onOpenChange={setReminderOpen}
      />
      <ReceiptChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </>
  );
}
