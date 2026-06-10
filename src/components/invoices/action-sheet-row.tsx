import { forwardRef } from "react";
import type React from "react";

import { ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";

interface ActionSheetRowProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: number;
  onClick: () => void;
}

export const ActionSheetRow = forwardRef<HTMLButtonElement, ActionSheetRowProps>(
  function ActionSheetRow({ icon, label, subtitle, badge, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-surface-2 active:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
      >
        {/* Icon tile */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-background text-ink-2">
          {icon}
        </span>

        {/* Label + subtitle */}
        <span className="min-w-0 flex-1">
          <span className="block text-15 font-semibold text-ink">{label}</span>
          {subtitle && (
            <span className="block truncate text-label font-semibold text-ink-3">{subtitle}</span>
          )}
        </span>

        {/* Count badge */}
        {badge != null && badge > 0 && (
          <span
            aria-hidden
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-coral-ink text-white text-12 font-extrabold",
              "h-5 min-w-5 px-1",
            )}
          >
            {badge}
          </span>
        )}

        {/* Chevron */}
        <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
      </button>
    );
  },
);
