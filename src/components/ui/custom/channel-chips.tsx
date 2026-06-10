"use client";

import { useRef, useState } from "react";
import { Mail, Share, WhatsApp } from "@/components/icons";
import type { SendChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChannelChipsProps {
  channel: SendChannel;
  onChannelChange: (c: SendChannel) => void;
  disabled: boolean;
}

const CHIPS = [
  { key: "whatsapp", disabled: false },
  { key: "sms", disabled: false },
  { key: "email", disabled: true },
] as const;

export function ChannelChips({ channel, onChannelChange, disabled }: ChannelChipsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving tabindex: falls back to the currently-selected chip when nothing has
  // been arrow-focused yet.
  const rovingIndex = focusedIndex ?? CHIPS.findIndex((c) => c.key === channel);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (rovingIndex + 1) % CHIPS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (rovingIndex - 1 + CHIPS.length) % CHIPS.length;
    }
    if (next === null) return;
    e.preventDefault();
    setFocusedIndex(next);
    chipRefs.current[next]?.focus();
    // Only select if the target chip is enabled
    if (!CHIPS[next].disabled) {
      onChannelChange(CHIPS[next].key as SendChannel);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby="send-channel-label"
      tabIndex={-1}
      className="flex flex-wrap items-center gap-1.5"
      onKeyDown={handleKeyDown}
    >
      {/* WhatsApp radio */}
      <button
        ref={(el) => {
          chipRefs.current[0] = el;
        }}
        type="button"
        role="radio"
        aria-checked={channel === "whatsapp"}
        tabIndex={0 === rovingIndex ? 0 : -1}
        disabled={disabled}
        onClick={() => {
          setFocusedIndex(0);
          onChannelChange("whatsapp");
        }}
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
        ref={(el) => {
          chipRefs.current[1] = el;
        }}
        type="button"
        role="radio"
        aria-checked={channel === "sms"}
        tabIndex={1 === rovingIndex ? 0 : -1}
        disabled={disabled}
        onClick={() => {
          setFocusedIndex(1);
          onChannelChange("sms");
        }}
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

      {/* Email — aria-disabled, participates in roving tabindex, not selectable */}
      <button
        ref={(el) => {
          chipRefs.current[2] = el;
        }}
        type="button"
        role="radio"
        aria-checked={false}
        aria-disabled="true"
        tabIndex={2 === rovingIndex ? 0 : -1}
        onClick={(e) => e.preventDefault()}
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-sm border border-ink-3 bg-card px-2.5 py-1 text-label font-bold text-ink-3 opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
      >
        <Mail className="size-3" aria-hidden />
        Email
        <span className="sr-only">No email on file</span>
      </button>
    </div>
  );
}
