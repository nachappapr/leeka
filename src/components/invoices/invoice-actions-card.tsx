"use client";

import { useState } from "react";

import { Card } from "@/components/ui/custom/card";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import type { Invoice } from "@/lib/types";
import { InvoiceActionsDraft } from "./invoice-actions-draft";
import { InvoiceActionsOpen } from "./invoice-actions-open";
import { InvoiceActionsPaid } from "./invoice-actions-paid";

interface InvoiceActionsCardProps {
  invoice: Invoice;
}

export function InvoiceActionsCard({ invoice }: InvoiceActionsCardProps) {
  const [sendOpen, setSendOpen] = useState(false);

  const status = invoice.status;
  const invoiceId = invoice.id;
  const isPaid = status === "paid";
  const isDraft = status === "draft";
  const isOverdue = status === "overdue";

  return (
    <>
      <Card title="Actions" headingLevel={3}>
        <div className="flex flex-col gap-2.5 px-6 py-5">
          {isPaid ? (
            <InvoiceActionsPaid onSend={() => setSendOpen(true)} />
          ) : isDraft ? (
            <InvoiceActionsDraft invoiceId={invoiceId} onSend={() => setSendOpen(true)} />
          ) : (
            <InvoiceActionsOpen
              invoiceId={invoiceId}
              isOverdue={isOverdue}
              onSend={() => setSendOpen(true)}
            />
          )}
        </div>
      </Card>
      <SendChannelsModal invoice={invoice} open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}
