"use client";

import * as React from "react";
import { Select } from "@base-ui/react/select";

import { cn } from "@/lib/utils";
import { ChevronDownIcon, Check } from "@/components/icons";

export interface BrandSelectOption {
  value: string;
  label: string;
}

export interface BrandSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: BrandSelectOption[];
  leadingIcon?: React.ReactNode;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  placeholder?: string;
  className?: string;
}

export function BrandSelect({
  value,
  onValueChange,
  options,
  leadingIcon,
  id,
  ariaLabel,
  ariaDescribedBy,
  placeholder,
  className,
}: BrandSelectProps) {
  return (
    <Select.Root items={options} value={value} onValueChange={(v) => onValueChange(v ?? "")}>
      <Select.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "w-full flex items-center gap-2.5 px-3.5 h-11 bg-card border border-line-strong rounded-md",
          "text-body-sm font-semibold text-ink text-left",
          "transition-[border-color,box-shadow]",
          "hover:border-ink-3",
          "data-popup-open:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press",
          "cursor-pointer",
          className,
        )}
      >
        {leadingIcon && (
          <span aria-hidden className="text-ink-3 shrink-0">
            {leadingIcon}
          </span>
        )}
        <Select.Value
          placeholder={placeholder}
          className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
        />
        <Select.Icon className="text-ink-3 shrink-0 transition-transform data-popup-open:rotate-180">
          <ChevronDownIcon size={16} aria-hidden />
        </Select.Icon>
      </Select.Trigger>

      {/* Popup */}
      <Select.Portal>
        <Select.Positioner sideOffset={6} align="start" className="isolate z-90">
          <Select.Popup className="min-w-(--anchor-width) bg-surface border border-line-strong rounded-md shadow-float p-1.5 max-h-65 overflow-y-auto">
            <Select.List>
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-sm",
                    "text-body-sm font-semibold text-ink-2 text-left",
                    "cursor-pointer outline-none",
                    "data-highlighted:bg-background data-highlighted:text-ink",
                    "data-selected:text-ink data-selected:font-bold",
                    "data-selected:data-highlighted:bg-coral-soft",
                  )}
                >
                  <Select.ItemText className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {opt.label}
                  </Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={15} strokeWidth={2.6} className="text-coral-press" aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
