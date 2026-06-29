"use client";

import * as React from "react";
import { useRef, useTransition } from "react";
import { Loader2, RotateCcw } from "@/components/icons";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { PillButton } from "@/components/ui/custom/pill-button";
import type { Invoice } from "@/lib/types";
import type { UnpaidDestination } from "@/lib/invoice/compute-unpaid-destination";
import { formatInvoiceDate } from "@/lib/utils";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { markInvoiceUnpaid } from "@/app/(app)/invoices/actions";
import type { InvoiceStatus } from "@/lib/types/lifecycle";

interface MarkUnpaidModalProps {
  invoice: Invoice;
  invoiceUuid: string;
  destination: UnpaidDestination;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus?: React.RefObject<HTMLElement | null>;
}

const DESTINATION_LABEL: Record<UnpaidDestination, string> = {
  overdue: "Overdue",
  viewed: "Viewed",
  sent: "Sent",
};

function labelFor(status: InvoiceStatus): string {
  const map: Partial<Record<InvoiceStatus, string>> = {
    overdue: "Overdue",
    viewed: "Viewed",
    sent: "Sent",
    paid: "Paid",
    draft: "Draft",
    cancelled: "Cancelled",
    partial: "Partial",
    pending: "Pending",
  };
  return map[status] ?? status;
}

export function MarkUnpaidModal({
  invoice,
  invoiceUuid,
  destination,
  open,
  onOpenChange,
  finalFocus,
}: MarkUnpaidModalProps) {
  const [isPending, startTransition] = useTransition();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const date = formatInvoiceDate(invoice.isoDate);
  const destinationLabel = DESTINATION_LABEL[destination];

  function handleConfirm() {
    if (isPending) return;
    if (!invoiceUuid) {
      brandToast.error({ title: "Couldn't mark as unpaid" });
      return;
    }
    startTransition(async () => {
      const result = await markInvoiceUnpaid({ invoiceId: invoiceUuid });
      if (!result.ok) {
        brandToast.error({ title: "Couldn't mark as unpaid", sub: result.error });
        return;
      }
      brandToast.success({
        title: "Marked as unpaid",
        sub: `${invoice.id} moved to ${labelFor(result.data.status)}`,
      });
      onOpenChange(false);
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent initialFocus={cancelRef} finalFocus={finalFocus}>
        <ModalHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-overdue-soft">
            <RotateCcw className="size-5.5 text-overdue-ink" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>Mark this invoice as unpaid?</ModalTitle>
            <ModalDescription>
              This removes the {invoice.amount} payment record and moves {invoice.id} back to{" "}
              <strong className="font-extrabold text-ink">{destinationLabel}</strong>. You can mark
              it paid again at any time.
            </ModalDescription>
          </div>
          <ModalClose aria-label="Close" />
        </ModalHeader>

        <ModalBody>
          <div className="rounded-lg border border-line bg-surface-2 px-4 py-3.5">
            <div className="flex items-center justify-between gap-4 py-2">
              <span className="min-w-24 text-kicker font-bold uppercase tracking-wide text-ink-3">
                Customer
              </span>
              <span className="text-body-sm font-bold text-ink">{invoice.customer}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-dashed border-line py-2">
              <span className="min-w-24 text-kicker font-bold uppercase tracking-wide text-ink-3">
                Amount
              </span>
              <div className="flex flex-col items-end text-right">
                <span className="text-lead font-bold tabular-nums text-ink">{invoice.amount}</span>
                <span className="text-label text-ink-3">
                  {invoice.id} · {date}
                </span>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="max-mobile:flex-wrap justify-end">
          <button
            ref={cancelRef}
            type="button"
            aria-disabled={isPending}
            onClick={() => {
              if (isPending) return;
              onOpenChange(false);
            }}
            className="h-11 rounded-lg border border-ink-3 bg-card px-4.5 text-body-sm font-bold text-ink transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 max-mobile:order-2 max-mobile:w-full"
          >
            Cancel
          </button>

          <PillButton
            tone="destructive"
            size="md"
            disabled={isPending}
            focusableWhenDisabled
            aria-busy={isPending}
            onClick={handleConfirm}
            className="rounded-lg aria-disabled:cursor-not-allowed aria-disabled:opacity-50 max-mobile:order-1 max-mobile:w-full max-mobile:h-13"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                Marking&hellip;
              </>
            ) : (
              <>
                <RotateCcw className="size-4" aria-hidden />
                Mark as unpaid
              </>
            )}
          </PillButton>

          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isPending ? "Marking invoice as unpaid…" : ""}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
