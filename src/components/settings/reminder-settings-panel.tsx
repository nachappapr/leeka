"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";

import { Mail, Plus, WhatsApp, XIcon } from "@/components/icons";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import type { ReminderChannel } from "@/lib/types/reminders";
import { cn } from "@/lib/utils";

const OFFSET_MIN = 0;
const OFFSET_MAX = 60;
const OFFSETS_MAX_COUNT = 6;

const CHANNELS: ReminderChannel[] = ["whatsapp", "email"];

interface ReminderSettingsPanelProps {
  channel: ReminderChannel;
  offsets: number[];
  isSaving: boolean;
  /** Announcement text for the live status region — empty string clears the announcement. */
  saveStatusMessage: string;
  /** Per-offset error strings, keyed by the offset day value. */
  offsetErrors: Record<number, string>;
  onChannelChange: (c: ReminderChannel) => void;
  onAddOffset: () => void;
  onRemoveOffset: (day: number) => void;
  onOffsetChange: (oldDay: number, raw: string) => void;
  onOffsetBlur: (oldDay: number, raw: string) => void;
}

export function ReminderSettingsPanel({
  channel,
  offsets,
  isSaving,
  saveStatusMessage,
  offsetErrors,
  onChannelChange,
  onAddOffset,
  onRemoveOffset,
  onOffsetChange,
  onOffsetBlur,
}: ReminderSettingsPanelProps) {
  const radioGroupRef = useRef<HTMLDivElement>(null);

  function handleChannelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const radios = radioGroupRef.current?.querySelectorAll('[role="radio"]');
    if (!radios) return;
    const arr = Array.from(radios) as HTMLElement[];
    const currentIdx = arr.findIndex((el) => el === document.activeElement);
    if (currentIdx === -1) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIdx + 1) % arr.length;
      onChannelChange(CHANNELS[next]);
      arr[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIdx - 1 + arr.length) % arr.length;
      onChannelChange(CHANNELS[prev]);
      arr[prev].focus();
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex flex-col gap-2">
        <p className="text-kicker font-bold uppercase tracking-wide text-ink-3">Send via</p>
        <div
          ref={radioGroupRef}
          role="radiogroup"
          aria-label="Reminder channel"
          tabIndex={-1}
          className="flex gap-2"
          onKeyDown={handleChannelKeyDown}
        >
          <button
            type="button"
            role="radio"
            disabled={isSaving}
            onClick={() => onChannelChange("whatsapp")}
            aria-checked={channel === "whatsapp"}
            tabIndex={channel === "whatsapp" ? 0 : -1}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-body-sm font-bold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              channel === "whatsapp"
                ? "border-whatsapp-icon bg-whatsapp-soft text-whatsapp-press"
                : "border-ink-3 bg-card text-ink hover:bg-background",
            )}
          >
            <WhatsApp
              className={cn(
                "size-4 shrink-0",
                channel === "whatsapp" ? "text-whatsapp-press" : "text-ink-3",
              )}
              aria-hidden
            />
            WhatsApp
          </button>
          <button
            type="button"
            role="radio"
            disabled={isSaving}
            onClick={() => onChannelChange("email")}
            aria-checked={channel === "email"}
            tabIndex={channel === "email" ? 0 : -1}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-body-sm font-bold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              channel === "email"
                ? "border-info bg-info-soft text-info"
                : "border-ink-3 bg-card text-ink hover:bg-background",
            )}
          >
            <Mail
              className={cn("size-4 shrink-0", channel === "email" ? "text-info" : "text-ink-3")}
              aria-hidden
            />
            Email
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-kicker font-bold uppercase tracking-wide text-ink-3">
          Days after due date
        </p>
        <ul className="flex flex-col gap-2" aria-label="Reminder day offsets">
          {offsets.map((day) => {
            const error = offsetErrors[day];
            const errorId = `offset-error-${day}`;
            return (
              <li key={day} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-caption text-ink-3">+</span>
                  <InputField
                    type="number"
                    size="bare"
                    min={OFFSET_MIN}
                    max={OFFSET_MAX}
                    defaultValue={day}
                    key={`offset-${day}`}
                    disabled={isSaving}
                    aria-label={`Offset: ${day} day${day === 1 ? "" : "s"} after due date`}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(e) => onOffsetChange(day, e.target.value)}
                    onBlur={(e) => onOffsetBlur(day, e.target.value)}
                    className="w-20"
                  />
                  <span className="text-caption text-ink-3">day{day === 1 ? "" : "s"}</span>
                  {offsets.length > 1 && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onRemoveOffset(day)}
                      aria-label={`Remove +${day} day offset`}
                      className={cn(
                        "ml-auto flex size-7 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors",
                        "hover:bg-overdue-soft hover:text-overdue",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      <XIcon className="size-3.5" aria-hidden />
                    </button>
                  )}
                </div>
                {error && (
                  <p id={errorId} role="alert" className="pl-7 text-body-sm text-overdue">
                    {error}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        {offsets.length < OFFSETS_MAX_COUNT && (
          <PillButton
            tone="secondary"
            size="sm"
            type="button"
            disabled={isSaving}
            onClick={onAddOffset}
            className="self-start"
          >
            <Plus className="size-3.5" aria-hidden />
            Add offset
          </PillButton>
        )}
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {saveStatusMessage}
      </p>
    </div>
  );
}
