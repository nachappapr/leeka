"use client";

import { cn } from "@/lib/utils";
import { BIZ_TYPES } from "@/lib/constants/auth";
import type { BizTypeId } from "@/lib/constants/auth";

interface BusinessTypePickerProps {
  value: BizTypeId | undefined;
  onChange: (id: BizTypeId) => void;
  describedBy?: string;
}

function BusinessTypePicker({ value, onChange, describedBy }: BusinessTypePickerProps) {
  return (
    <div
      role="group"
      aria-labelledby="ob-biz-type-label"
      aria-describedby={describedBy}
      className="grid grid-cols-2 gap-2.5 max-mobile:grid-cols-1"
    >
      {BIZ_TYPES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={cn(
            "flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left text-body-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2",
            value === id
              ? "border-coral-press bg-coral-soft text-coral-ink"
              : "border-line bg-surface text-ink hover:border-line-strong",
          )}
        >
          <Icon
            className={cn("size-5 shrink-0", value === id ? "text-coral" : "text-ink-3")}
            aria-hidden="true"
          />
          {label}
        </button>
      ))}
    </div>
  );
}

export { BusinessTypePicker };
