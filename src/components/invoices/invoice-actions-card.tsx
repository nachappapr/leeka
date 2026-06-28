"use client";

import { useState } from "react";

import { Card } from "@/components/ui/custom/card";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import type { Invoice } from "@/lib/types";
import { InvoiceActionsCancelled } from "./invoice-actions-cancelled";
import { InvoiceActionsDraft } from "./invoice-actions-draft";
import { InvoiceActionsOpen } from "./invoice-actions-open";
import { InvoiceActionsPaid } from "./invoice-actions-paid";
import { ReminderChannelsModal } from "./reminder-channels-modal";

interface InvoiceActionsCardProps {
  invoice: Invoice;
}

export function InvoiceActionsCard({ invoice }: InvoiceActionsCardProps) {
  const [sendOpen, setSendOpen] = useState(false);
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
            <InvoiceActionsPaid onSend={() => setSendOpen(true)} />
          ) : isDraft ? (
            <InvoiceActionsDraft
              invoiceId={invoiceId}
              invoiceUuid={invoice.invoiceUuid ?? ""}
              onSend={() => setSendOpen(true)}
            />
          ) : (
            <InvoiceActionsOpen
              invoiceId={invoiceId}
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
    </>
  );
}
