"use client";

// Uses the app's canonical field accent-focus design — the same treatment as
// InputField/TextareaField (`border-coral` + `ring-coral-soft`) — but in GREEN
// for the WhatsApp note: neutral `border-line` at rest (inherited from
// TextareaField), then `border-whatsapp-icon` (#178040) + a soft `ring-whatsapp-soft`
// halo on focus. The field auto-focuses when the note panel opens, so the green
// border + soft green ring show immediately (matches the design).
//
// A11y: the rest→focus change (neutral line border → solid #178040 green border at
// 5.00:1 on bg-card) is clearly perceptible (WCAG 2.4.7 / 2.4.11) and the focused
// border meets the 3:1 control-boundary requirement (WCAG 1.4.11).

import { FieldLabel } from "@/components/ui/custom/field-label";
import { TextareaField } from "@/components/ui/custom/textarea-field";
import { cn } from "@/lib/utils";

interface SendNoteFieldProps {
  note: string;
  onChange: (v: string) => void;
  disabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function SendNoteField({ note, onChange, disabled, textareaRef }: SendNoteFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor="send-modal-note">Note</FieldLabel>
      <TextareaField
        id="send-modal-note"
        ref={textareaRef}
        value={note}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={280}
        placeholder="Hi! Here's your invoice — let me know if you have any questions."
        rows={3}
        aria-describedby="send-modal-note-count"
        className={cn(
          "min-h-16 resize-y text-body-sm text-ink placeholder:text-ink-3",
          "outline-none transition-[border-color,box-shadow]",
          // Canonical field accent-focus design (cf. InputField "bare":
          // border-coral + ring-coral-soft) — but green for the WhatsApp note.
          "focus-visible:border-whatsapp-icon focus-visible:ring-3 focus-visible:ring-whatsapp-soft",
        )}
      />
      <p
        id="send-modal-note-count"
        aria-live="polite"
        aria-atomic="true"
        className="text-right text-label text-ink-3"
      >
        {note.length}/280
      </p>
    </div>
  );
}
