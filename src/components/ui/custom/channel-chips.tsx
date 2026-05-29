"use client";

import { Mail, Share, WhatsApp } from "@/components/icons";
import type { SendChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChannelChipsProps {
  channel: SendChannel;
  onChannelChange: (c: SendChannel) => void;
  disabled: boolean;
}

export function ChannelChips({ channel, onChannelChange, disabled }: ChannelChipsProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onChannelChange(channel === "whatsapp" ? "sms" : "whatsapp");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onChannelChange(channel === "whatsapp" ? "sms" : "whatsapp");
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby="send-channel-label"
      tabIndex={-1}
      className="flex items-center gap-1.5"
      onKeyDown={handleKeyDown}
    >
      {/* WhatsApp radio */}
      <button
        type="button"
        role="radio"
        aria-checked={channel === "whatsapp"}
        tabIndex={channel === "whatsapp" ? 0 : -1}
        disabled={disabled}
        onClick={() => onChannelChange("whatsapp")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-label font-bold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed",
          channel === "whatsapp"
            ? "border border-whatsapp-icon bg-whatsapp-icon text-card"
            : "border border-ink-3 bg-card text-ink-3 hover:bg-surface-2",
        )}
      >
        <WhatsApp className="size-3" aria-hidden />
        WhatsApp
      </button>

      {/* SMS radio */}
      <button
        type="button"
        role="radio"
        aria-checked={channel === "sms"}
        tabIndex={channel === "sms" ? 0 : -1}
        disabled={disabled}
        onClick={() => onChannelChange("sms")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-label font-bold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed",
          channel === "sms"
            ? "border border-whatsapp-icon bg-whatsapp-icon text-card"
            : "border border-ink-3 bg-card text-ink-3 hover:bg-surface-2",
        )}
      >
        <Share className="size-3" aria-hidden />
        SMS
      </button>

      {/* Email — aria-disabled, stays in a11y tree, not selectable */}
      <button
        type="button"
        role="radio"
        aria-checked={false}
        aria-disabled="true"
        tabIndex={-1}
        onClick={(e) => e.preventDefault()}
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-sm border border-ink-3 bg-card px-2.5 py-1 text-label font-bold text-ink-3 opacity-45"
      >
        <Mail className="size-3" aria-hidden />
        Email
        <span className="sr-only">No email on file</span>
      </button>
    </div>
  );
}
