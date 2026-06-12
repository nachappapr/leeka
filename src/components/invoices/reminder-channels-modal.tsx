"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { KeyboardEvent } from "react";
import { AlertCircle, Bell, Check, Info, Loader2, Mail, WhatsApp } from "@/components/icons";
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
import { sendReminder } from "@/app/(app)/invoices/actions";
import type { Invoice } from "@/lib/types";
import type { SendState } from "@/lib/types";
import type { ReminderChannel } from "@/lib/types/reminders";
import { cn } from "@/lib/utils";

const CHANNELS: ReminderChannel[] = ["whatsapp", "email"];

interface ReminderChannelsModalProps {
  invoice: Invoice;
  /**
   * The Postgres UUID of the invoice row required by sendReminder.
   * Callers on mock/draft data pass an empty string; the action returns
   * { ok:false, error:"Invalid invoice ID" } which the failure UI shows.
   */
  invoiceUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChannelButtonProps {
  value: ReminderChannel;
  current: ReminderChannel;
  disabled: boolean;
  onSelect: (c: ReminderChannel) => void;
}

function ChannelButton({ value, current, disabled, onSelect }: ChannelButtonProps) {
  const isWhatsApp = value === "whatsapp";
  const isSelected = current === value;
  return (
    <button
      type="button"
      role="radio"
      disabled={disabled}
      onClick={() => onSelect(value)}
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left text-body-sm font-bold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && isWhatsApp && "border-whatsapp-icon bg-whatsapp-soft text-whatsapp-press",
        isSelected && !isWhatsApp && "border-info bg-info-soft text-info",
        !isSelected && "border-ink-3 bg-surface-2 text-ink hover:bg-line",
      )}
    >
      {isWhatsApp ? (
        <WhatsApp
          className={cn("size-4.5 shrink-0", isSelected ? "text-whatsapp-press" : "text-ink-3")}
          aria-hidden
        />
      ) : (
        <Mail
          className={cn("size-4.5 shrink-0", isSelected ? "text-info" : "text-ink-3")}
          aria-hidden
        />
      )}
      {isWhatsApp ? "WhatsApp" : "Email"}
    </button>
  );
}

interface SendButtonContentProps {
  sendState: SendState;
  isSending: boolean;
  channelLabel: string;
  channel: ReminderChannel;
}

function SendButtonContent({
  sendState,
  isSending,
  channelLabel,
  channel,
}: SendButtonContentProps) {
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
      {channel === "whatsapp" ? (
        <WhatsApp className="size-4" aria-hidden />
      ) : (
        <Mail className="size-4" aria-hidden />
      )}
      Send on {channelLabel}
    </>
  );
}

export function ReminderChannelsModal({
  invoice,
  invoiceUuid,
  open,
  onOpenChange,
}: ReminderChannelsModalProps) {
  const [channel, setChannel] = useState<ReminderChannel>("whatsapp");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSkipped, setIsSkipped] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isPending, startTransition] = useTransition();
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // Reset transient state on closed → open transition (render-phase adjustment,
  // not an effect, to avoid the Base UI backdrop-stuck bug from key-remounting).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setChannel("whatsapp");
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
  const channelLabel = channel === "whatsapp" ? "WhatsApp" : "Email";
  const isBusy = sendState === "sending" || sendState === "sent";
  const isSending = sendState === "sending" || isPending;

  function handleChannelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const radios = radioGroupRef.current?.querySelectorAll('[role="radio"]');
    if (!radios) return;
    const arr = Array.from(radios) as HTMLElement[];
    const currentIdx = arr.findIndex((el) => el === document.activeElement);
    if (currentIdx === -1) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIdx + 1) % arr.length;
      setChannel(CHANNELS[next]);
      arr[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIdx - 1 + arr.length) % arr.length;
      setChannel(CHANNELS[prev]);
      arr[prev].focus();
    }
  }

  function handleSend() {
    setSendState("sending");
    setSendError(null);
    setIsSkipped(false);
    startTransition(async () => {
      const result = await sendReminder({ invoiceId: invoiceUuid, channel });
      if (result.ok) {
        setSendState("sent");
        if (result.data.skipped) {
          setIsSkipped(true);
          brandToast.warn({
            title: `Reminder logged — ${channelLabel} not configured`,
            sub: "Set up credentials to enable live dispatch.",
          });
        } else {
          brandToast.success({ title: `Reminder sent to ${firstName} on ${channelLabel}` });
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
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-pending-soft">
            <Bell className="size-5.5 text-pending-bar" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ModalTitle>Send reminder for {invoice.id}?</ModalTitle>
            <ModalDescription>
              Choose how to remind {firstName} about this outstanding invoice.
            </ModalDescription>
          </div>
          <ModalClose />
        </ModalHeader>

        <ModalBody className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-kicker font-bold uppercase tracking-wide text-ink-3">Send via</p>
            <div
              ref={radioGroupRef}
              role="radiogroup"
              aria-label="Reminder channel"
              tabIndex={-1}
              className="grid grid-cols-2 gap-2"
              onKeyDown={handleChannelKeyDown}
            >
              <ChannelButton
                value="whatsapp"
                current={channel}
                disabled={isBusy}
                onSelect={setChannel}
              />
              <ChannelButton
                value="email"
                current={channel}
                disabled={isBusy}
                onSelect={setChannel}
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-line bg-surface-2 px-3.5 py-3">
            <Info className="size-4 shrink-0 text-info" aria-hidden />
            <p className="text-caption leading-relaxed text-ink-2">
              <strong className="font-extrabold text-ink">
                A reminder includes the payment link.
              </strong>{" "}
              The customer can pay directly from the message.
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
                <strong className="font-extrabold">Reminder logged.</strong> {channelLabel}{" "}
                credentials are not configured — live dispatch was skipped.
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
            tone={channel === "whatsapp" ? "whatsapp" : "primary"}
            size="md"
            disabled={isBusy}
            onClick={handleSend}
            className="rounded-lg max-mobile:order-1 max-mobile:w-full max-mobile:h-13"
          >
            <SendButtonContent
              sendState={sendState}
              isSending={isSending}
              channelLabel={channelLabel}
              channel={channel}
            />
          </PillButton>

          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {isSending ? "Sending reminder…" : ""}
          </p>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
