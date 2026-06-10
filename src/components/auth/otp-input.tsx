"use client";

import { useRef, useState, useCallback, type ClipboardEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // digits array derived from value string
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusIndex = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, idx));
    inputRefs.current[clamped]?.focus();
  }, []);

  function handleChange(idx: number, char: string) {
    // Only accept single digit
    const digit = char.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === idx ? digit : d));
    onChange(next.join(""));
    if (digit && idx < OTP_LENGTH - 1) {
      focusIndex(idx + 1);
    }
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (disabled && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = digits.map((d, i) => (i === idx ? "" : d));
        onChange(next.join(""));
      } else if (idx > 0) {
        focusIndex(idx - 1);
        const next = digits.map((d, i) => (i === idx - 1 ? "" : d));
        onChange(next.join(""));
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && idx > 0) {
      focusIndex(idx - 1);
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      focusIndex(idx + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? "");
    onChange(next.join(""));
    // Focus last filled or last box
    const lastIdx = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    focusIndex(lastIdx);
  }

  const [focused, setFocused] = useState<number | null>(null);

  return (
    <div role="group" aria-label="One-time password" className="grid grid-cols-6 gap-2.5">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          readOnly={disabled}
          aria-disabled={disabled}
          aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={() => setFocused(idx)}
          onBlur={() => setFocused(null)}
          className={cn(
            "h-16 w-full rounded-xl border-2 bg-surface text-center text-26 font-extrabold tabular-nums text-ink outline-none transition-all duration-150 max-mobile:h-14 max-mobile:text-title",
            "aria-disabled:pointer-events-none aria-disabled:opacity-50",
            focused === idx
              ? "border-coral ring-4 ring-coral/14"
              : digit
                ? "border-line-strong"
                : "border-line hover:border-line-strong",
          )}
        />
      ))}
    </div>
  );
}

export { OtpInput };
