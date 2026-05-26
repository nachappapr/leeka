import { FILTER_CHIPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FilterChips() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-none">
      {FILTER_CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          aria-pressed={chip.active}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-body-sm font-bold transition-colors",
            chip.active
              ? "bg-ink text-white"
              : "border border-border bg-card text-ink-2 hover:bg-surface-2",
          )}
        >
          {chip.label}
          <span
            className={cn(
              "rounded-full px-2 py-px text-label font-extrabold",
              chip.active
                ? "bg-white/20 text-white"
                : "bg-background text-ink-3",
            )}
          >
            {chip.count}
          </span>
        </button>
      ))}
    </div>
  );
}
