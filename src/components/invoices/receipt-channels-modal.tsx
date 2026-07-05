"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, Check, Info, Loader2, WhatsApp } from "@/components/icons";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { sendReceipt } from "@/app/(app)/invoices/actions";
import type { Invoice } from "@/lib/types";
import type { SendState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReceiptChannelsModalProps {
  invoice: Invoice;
  /**
   * The Postgres UUID of the invoice row required by sendReceipt.
   * Callers on mock/draft data pass an empty string; the action returns
   * { ok:false, error:"Invalid invoice ID" } which the failure UI shows.
   */
  invoiceUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SendButtonContentProps {
  sendState: SendState;
  isSending: boolean;
}

function SendButtonContent({ sendState, isSending }: SendButtonContentProps) {
  if (isSending) {
    return (
      <>
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        Sending&hellip;
      </>
    );
  }
  if (sendState === "sent") {
    return (
      <>
        <Check className="size-4" aria-hidden />
        Sent
      </>
    );
  }
  if (sendState === "failed") {
    return (
      <>
        <AlertCircle className="size-4" aria-hidden />
        Retry
      </>
    );
  }
  return (
    <>
      <WhatsApp className="size-4" aria-hidden />
      Send on WhatsApp
    </>
  );
}

export function ReceiptChannelsModal({
  invoice,
  invoiceUuid,
  open,
  onOpenChange,
}: ReceiptChannelsModalProps) {
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPending, startTransition] = useTransition();

  // Reset transient state on closed → open transition (render-phase adjustment,
  // not an effect, to avoid the Base UI backdrop-stuck bug from key-remounting).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSendState("idle");
      setSendError(null);
      setIsSkipped(false);
    }
  }

  useEffect(() => {
    if (open) return;
    const timers = timersRef.current;
    timers.forEach(clearTimeout);
    timersRef.current = [];
  }, [open]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  const firstName = invoice.customer.split(" ")[0];
  const isBusy = sendState === "sending" || sendState === "sent";
  const isSending = sendState === "sending" || isPending;

  function handleSend() {
    setSendState("sending");
    setSendError(null);
    setIsSkipped(false);
    startTransition(async () => {
      const result = await sendReceipt(invoiceUuid);
      if (result.ok) {
        setSendState("sent");
        if (result.data.skipped) {
          setIsSkipped(true);
          brandToast.warn({
            title: "Receipt logged — WhatsApp not configured",
            sub: "Set up credentials to enable live dispatch.",
          });
        } else {
          brandToast.success({ title: `Receipt sent to ${firstName} on WhatsApp` });
        }
        const t = setTimeout(() => onOpenChange(false), 700);
        timersRef.current.push(t);
      } else {
        setSendState("failed");
        setSendError(result.error);
      }
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-whatsapp-soft">
            <WhatsApp className="size-5.5 text-whatsapp-press" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>Send receipt for {invoice.id}?</ModalTitle>
            <ModalDescription>
              Send {firstName} a payment receipt on WhatsApp &mdash; a thank-you that links to their
              paid invoice.
            </ModalDescription>
          </div>
          <ModalClose aria-label="Close" />
        </ModalHeader>

        <ModalBody className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface-2 px-3.5 py-3">
            <Info className="size-4 shrink-0 text-info" aria-hidden />
            <p className="text-caption leading-relaxed text-ink-2">
              <strong className="font-extrabold text-ink">Proof of payment.</strong> The receipt
              links to the paid invoice page &mdash; proof their payment was received.
            </p>
          </div>

          {sendState === "sent" && isSkipped && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2.5 rounded-md border border-pending-bar bg-pending-soft px-3.5 py-3"
            >
              <Info className="size-4 shrink-0 text-pending-bar" aria-hidden />
              <p className="text-caption leading-relaxed text-pending-ink">
                <strong className="font-extrabold">Receipt logged.</strong> WhatsApp credentials are
                not configured &mdash; live dispatch was skipped.
              </p>
            </div>
          )}

          {sendState === "failed" && sendError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-overdue bg-overdue-soft px-3.5 py-3"
            >
              <AlertCircle className="size-4 shrink-0 text-overdue" aria-hidden />
              <p className="text-caption leading-relaxed text-overdue-ink">
                <strong className="font-extrabold">Failed to send.</strong> {sendError}
              </p>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="max-mobile:flex-wrap">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
            className={cn(
              "mr-auto h-11 rounded-lg border border-ink-3 bg-card px-4.5 text-body-sm font-bold text-ink transition-colors hover:bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50 max-mobile:order-2",
            )}
          >
            Cancel
          </button>

          <PillButton
            tone="whatsapp"
            size="md"
            disabled={isBusy}
            onClick={handleSend}
            className="rounded-lg max-mobile:order-1 max-mobile:w-full max-mobile:h-13"
          >
            <SendButtonContent sendState={sendState} isSending={isSending} />
          </PillButton>

          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isSending ? "Sending receipt…" : ""}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
