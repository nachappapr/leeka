"use client";

// ── SendChannelsModal ────────────────────────────────────────────────────────
// Cross-cutting "Send invoice via channel" modal, relocated from
// src/components/invoices/invoice-send-modal.tsx → src/components/ui/custom/.
//
// Moved here because the send-channels pattern is app-wide (any invoice can
// trigger it from any surface — list rows, detail pages, future review screens).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  Edit,
  Info,
  Loader2,
  Share,
  WhatsApp,
  XIcon,
} from "@/components/icons";
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
import { SendSummaryCard } from "@/components/ui/custom/send-summary-card";
import { SendNoteField } from "@/components/ui/custom/send-note-field";
import type { Invoice } from "@/lib/types";
import type { SendChannel, SendState } from "@/lib/types";
import { formatInvoiceDate, payLinkFor, cn } from "@/lib/utils";
import { INVOICE_STATUS_LABEL } from "@/lib/constants/invoices";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { sendInvoice } from "@/app/(app)/invoices/actions";

interface SendChannelsModalProps {
  invoice: Invoice;
  /**
   * The Postgres UUID of the invoice row, required by the sendInvoice Server
   * Action. Callers on mock/draft data pass an empty string; the action will
   * return { ok:false, error:"Invalid invoice ID" } which the failure UI shows.
   */
  invoiceUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendChannelsModal({
  invoice,
  invoiceUuid,
  open,
  onOpenChange,
}: SendChannelsModalProps) {
  const [channel, setChannel] = useState<SendChannel>("whatsapp");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPending, startTransition] = useTransition();

  // Reset transient state when the modal transitions closed -> open, using
  // React's sanctioned render-phase state adjustment (not an effect, not a key
  // remount).
  //
  // This replaces a previous `key={open ? "open" : "closed"}` remount on the
  // wrapper, which caused the "page becomes unclickable after close" bug:
  // flipping `open` to false changed the key, unmounting the live popup and
  // mounting a fresh overlay/popup ALREADY in Base UI's exit-animation state
  // (`data-ending-style`, opacity-0). With no start->end change the CSS
  // transition never ran, `transitionend` never fired, and Base UI never
  // unmounted its full-screen backdrop — it stayed on top of the page (z-80,
  // pointer-events:auto) swallowing every click. Keeping the component mounted
  // lets Base UI run the real exit transition and tear the overlay down.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setChannel("whatsapp");
      setSendState("idle");
      setSendError(null);
      setNoteOpen(false);
      setNote("");
    }
  }

  // Cancel any in-flight send timers when the modal closes, so a send that was
  // interrupted by closing can't later flip state / fire a toast on the (now
  // hidden but still-mounted) component.
  useEffect(() => {
    if (open) return;
    const timers = timersRef.current;
    timers.forEach(clearTimeout);
    timersRef.current = [];
  }, [open]);

  // Cancel pending timers on unmount to prevent setState on unmounted tree
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Focus the textarea when the note panel opens
  useEffect(() => {
    if (noteOpen) {
      noteRef.current?.focus();
    }
  }, [noteOpen]);

  const firstName = invoice.customer.split(" ")[0];
  // Phone is display-only in SendSummaryCard; recipient is resolved server-side.
  // TODO: thread real customer phone from the data layer when Invoice carries it.
  const phone = "+91 98765 12345";
  const date = formatInvoiceDate(invoice.isoDate);
  const statusLabel = INVOICE_STATUS_LABEL[invoice.status];
  const channelName = channel === "whatsapp" ? "WhatsApp" : "SMS";

  // "failed" allows retry — controls stay enabled so the user can try again.
  const isBusy = sendState === "sending" || sendState === "sent";

  function handleSend() {
    // SMS channel is WhatsApp-only for now; the sendInvoice action dispatches
    // WhatsApp only. If the user somehow reaches SMS send, show a static error.
    if (channel === "sms") {
      setSendState("failed");
      setSendError("SMS delivery is not yet available. Please use WhatsApp.");
      return;
    }

    setSendState("sending");
    setSendError(null);

    startTransition(async () => {
      const result = await sendInvoice(invoiceUuid);

      if (result.ok) {
        // { ok:true, data:{ skipped:true } } is the dev/CI env-gated path —
        // treat it as success: toast fires, modal closes.
        setSendState("sent");

        // Sonner's aria-live region announces the toast — do NOT add a second
        // sr-only "Invoice sent" announcement here (that would double-announce).
        const url = payLinkFor(invoice.id);
        const fullUrl = `https://${url}`;
        brandToast.success({
          title: `Sent to ${firstName} on ${channelName}`,
          sub: `Pay link: ${url} · ${invoice.amount}`,
          actions: [
            {
              label: "Copy link",
              icon: <Share className="size-3.5" aria-hidden />,
              onClick: () => {
                try {
                  void navigator.clipboard.writeText(fullUrl);
                } catch {
                  // Clipboard unavailable or permission denied — fail silently
                }
              },
            },
            {
              label: "View chat",
              icon: <WhatsApp className="size-3.5" aria-hidden />,
              onClick: () => {
                // TODO: open WhatsApp chat thread when messaging is wired
              },
            },
          ],
        });

        const t = setTimeout(() => onOpenChange(false), 700);
        timersRef.current.push(t);
      } else {
        setSendState("failed");
        setSendError(result.error);
      }
    });
  }

  function handleToggleNote() {
    if (noteOpen) setNote("");
    setNoteOpen((prev) => !prev);
  }

  const isSending = sendState === "sending" || isPending;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-whatsapp">
            <WhatsApp className="size-5.5 text-card" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>
              Send {invoice.id} to {firstName}?
            </ModalTitle>
            <ModalDescription>
              We&apos;ll generate a fresh payment link and send it on {channelName} with the invoice
              PDF.
            </ModalDescription>
          </div>
          <ModalClose />
        </ModalHeader>

        <ModalBody className="flex flex-col gap-3">
          <SendSummaryCard
            invoice={invoice}
            phone={phone}
            channel={channel}
            onChannelChange={setChannel}
            isBusy={isBusy}
            statusLabel={statusLabel}
            date={date}
          />

          {/* Info tip */}
          <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface-2 px-3.5 py-3">
            <Info className="size-4 shrink-0 text-info" aria-hidden />
            <p className="text-caption leading-relaxed text-ink-2">
              <strong className="font-extrabold text-ink">
                Payment link is created when you tap send.
              </strong>{" "}
              Customer taps &rarr; pays on the hosted page &rarr; we mark it paid automatically.
            </p>
          </div>

          {/* Failure banner — shown when the send action returns an error */}
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

          {noteOpen && (
            <SendNoteField note={note} onChange={setNote} disabled={isBusy} textareaRef={noteRef} />
          )}
        </ModalBody>

        <ModalFooter className="max-mobile:flex-wrap">
          {/* Add / Remove note toggle */}
          <button
            type="button"
            disabled={isBusy}
            onClick={handleToggleNote}
            className={cn(
              "mr-auto inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-caption transition-colors min-h-11",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "max-mobile:order-2",
              noteOpen ? "text-overdue hover:text-overdue-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            {noteOpen ? (
              <XIcon className="size-3.5" aria-hidden />
            ) : (
              <Edit className="size-3.5" aria-hidden />
            )}
            {noteOpen ? "Remove note" : "Add a note"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
            className={cn(
              "h-11 rounded-lg border border-ink-3 bg-card px-4.5 text-body-sm font-bold text-ink transition-colors hover:bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "max-mobile:order-3",
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
            {isSending ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                Sending&hellip;
              </>
            ) : sendState === "sent" ? (
              <>
                <Check className="size-4" aria-hidden />
                Sent
              </>
            ) : sendState === "failed" ? (
              <>
                <AlertCircle className="size-4" aria-hidden />
                Retry
              </>
            ) : (
              <>
                <WhatsApp className="size-4" aria-hidden />
                {channel === "whatsapp" ? "Send on WhatsApp" : "Send via SMS"}
              </>
            )}
          </PillButton>

          {/* Live region: announces "Sending invoice…" for the sending state only.
              The "sent" success is announced by Sonner's own aria-live region (the
              toast) — adding a second announcement here would double-announce it.
              This live region is intentionally silent on sendState === "sent".
              For "failed", the inline role="alert" banner above is the announcement
              vehicle — no second announcement needed here. */}
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isSending ? "Sending invoice…" : ""}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
