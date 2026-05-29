"use client";

// ── SendChannelsModal ────────────────────────────────────────────────────────
// Cross-cutting "Send invoice via channel" modal, relocated from
// src/components/invoices/invoice-send-modal.tsx → src/components/ui/custom/.
//
// Moved here because the send-channels pattern is app-wide (any invoice can
// trigger it from any surface — list rows, detail pages, future review screens).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
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

interface SendChannelsModalProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendChannelsModal({
  invoice,
  open,
  onOpenChange,
}: SendChannelsModalProps) {
  const [channel, setChannel] = useState<SendChannel>("whatsapp");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
  const phone = "+91 98765 12345"; // TODO: real phone from customer record
  const date = formatInvoiceDate(invoice.isoDate);
  const statusLabel = INVOICE_STATUS_LABEL[invoice.status];
  const channelName = channel === "whatsapp" ? "WhatsApp" : "SMS";
  const isBusy = sendState === "sending" || sendState === "sent";

  function handleSend() {
    setSendState("sending");
    // TODO: wire real send when backend exists
    const t1 = setTimeout(() => {
      setSendState("sent");

      // Task 3: fire success toast with runDirect happy path content.
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

      const t2 = setTimeout(() => onOpenChange(false), 700);
      timersRef.current.push(t2);
    }, 1100);
    timersRef.current.push(t1);
  }

  function handleToggleNote() {
    if (noteOpen) setNote("");
    setNoteOpen((prev) => !prev);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-whatsapp-icon">
            <WhatsApp className="size-5.5 text-card" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>
              Send {invoice.id} to {firstName}?
            </ModalTitle>
            <ModalDescription>
              We&apos;ll generate a fresh payment link and send it on {channelName}{" "}
              with the invoice PDF.
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
              Customer taps &rarr; pays on the hosted page &rarr; we mark it paid
              automatically.
            </p>
          </div>

          {noteOpen && (
            <SendNoteField
              note={note}
              onChange={setNote}
              disabled={isBusy}
              textareaRef={noteRef}
            />
          )}
        </ModalBody>

        <ModalFooter>
          {/* Add / Remove note toggle */}
          <button
            type="button"
            disabled={isBusy}
            onClick={handleToggleNote}
            className={cn(
              "mr-auto inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-caption transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
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
            )}
          >
            Cancel
          </button>

          <PillButton
            tone="whatsapp"
            size="md"
            disabled={isBusy}
            onClick={handleSend}
            className="rounded-lg"
          >
            {sendState === "sending" ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                Sending&hellip;
              </>
            ) : sendState === "sent" ? (
              <>
                <Check className="size-4" aria-hidden />
                Sent
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
              This live region is intentionally silent on sendState === "sent". */}
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {sendState === "sending" ? "Sending invoice…" : ""}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
