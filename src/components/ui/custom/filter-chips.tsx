"use client";

import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface FilterChipsItem {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  items: ReadonlyArray<FilterChipsItem>;
  value: string;
  onValueChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function FilterChips({
  items,
  value,
  onValueChange,
  ariaLabel,
  className,
}: FilterChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const chips = containerRef.current?.querySelectorAll('[role="radio"]');
    if (!chips) return;
    const arr = Array.from(chips) as HTMLElement[];
    const currentIdx = arr.findIndex((el) => el === document.activeElement);
    if (currentIdx === -1) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIdx + 1) % arr.length;
      onValueChange(items[next].id);
      arr[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIdx - 1 + arr.length) % arr.length;
      onValueChange(items[prev].id);
      arr[prev].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      onValueChange(items[0].id);
      arr[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      onValueChange(items[items.length - 1].id);
      arr[arr.length - 1].focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn("flex items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-none", className)}
    >
      {items.map((item) => {
        const isActive = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-caption font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              isActive
                ? "border-transparent bg-ink text-white"
                : "border-ink-3 bg-card text-ink-2 hover:bg-surface-2",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-px text-kicker font-extrabold",
                  isActive ? "bg-white/20 text-white" : "bg-background text-ink-3",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
