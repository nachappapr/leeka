"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CalendarIcon } from "@/components/icons";
import { Calendar } from "@/components/ui/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/primitives/popover";

export interface BrandDatePickerProps {
  value: string;
  onValueChange: (v: string) => void;
  ariaLabel?: string;
  id?: string;
  placeholder?: string;
  className?: string;
}

/** Parse a local yyyy-mm-dd string to a Date without UTC shift. */
function parseLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const parts = iso.split("-");
  if (parts.length !== 3) return undefined;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return undefined;
  return new Date(y, m - 1, d);
}

/** Format a Date to yyyy-mm-dd in local time with zero-padding. */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BrandDatePicker({
  value,
  onValueChange,
  ariaLabel,
  id,
  placeholder = "Pick a date",
  className,
}: BrandDatePickerProps) {
  const date = parseLocalDate(value);

  const displayLabel = date
    ? date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  function handleSelect(selected: Date | undefined) {
    onValueChange(selected ? formatLocalDate(selected) : "");
  }

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "w-full h-11 px-3.5 flex items-center justify-between gap-2",
          "bg-card text-body-sm font-semibold border border-line-strong rounded-md text-left",
          "transition-[border-color,box-shadow]",
          "hover:border-ink-3",
          "data-popup-open:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press",
          className,
        )}
      >
        <span
          className={cn(
            "flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap",
            !displayLabel && "text-ink-3",
          )}
        >
          {displayLabel ?? placeholder}
        </span>
        <CalendarIcon size={16} className="text-ink-3 shrink-0" aria-hidden />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        positionerClassName="z-90"
        className="w-auto p-0 bg-surface border border-line-strong shadow-float rounded-md ring-0"
      >
        <PopoverTitle className="sr-only">
          {ariaLabel ?? "Select date"}
        </PopoverTitle>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          classNames={{
            weekday:
              "flex-1 text-center text-label font-normal text-ink-3 select-none",
            day_button:
              "text-body-sm text-ink-2 rounded-md hover:bg-background",
            selected:
              "bg-coral-soft text-coral-ink font-bold rounded-md ring-1 ring-coral-press",
            today: "rounded-md bg-surface-2 text-coral-ink font-bold",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
