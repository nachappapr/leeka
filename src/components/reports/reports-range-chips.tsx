import Link from "next/link";

import { cn } from "@/lib/utils";
import { RANGE_DEFS } from "@/lib/constants/reports";
import type { RangeId } from "@/lib/types/reports";

interface ReportsRangeChipsProps {
  selected: RangeId;
}

export function ReportsRangeChips({ selected }: ReportsRangeChipsProps) {
  return (
    <nav aria-label="Date range" className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {RANGE_DEFS.map((range) => {
        const isActive = range.id === selected;
        return (
          <Link
            key={range.id}
            href={`/reports?range=${range.id}`}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full border-[1.5px] px-3.5 text-caption font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              isActive
                ? "border-transparent bg-ink text-white underline underline-offset-2"
                : "border-ink-3 bg-card text-ink-2 hover:bg-surface-2",
            )}
          >
            {range.label}
          </Link>
        );
      })}
    </nav>
  );
}
