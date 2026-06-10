"use client";

import { Download } from "@/components/icons";
import { formatRupees } from "@/lib/utils/format-currency";

interface ExportSummaryBoxProps {
  matchCount: number;
  totalAmt: number;
  filename: string;
}

export function ExportSummaryBox({ matchCount, totalAmt, filename }: ExportSummaryBoxProps) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 bg-background border border-dashed border-line-strong rounded-lg mt-1.5 mb-4">
      <div className="flex-1 min-w-0">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-body font-black text-ink"
        >
          {matchCount === 0
            ? "No invoices match these filters"
            : `${matchCount} invoice${matchCount === 1 ? "" : "s"} · ${formatRupees(totalAmt)}`}
        </div>
        <div
          className="mt-1 text-11 font-mono text-ink-3 flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
          title={filename}
        >
          <Download size={12} aria-hidden className="shrink-0" />
          {filename}
        </div>
      </div>
      {matchCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-1 bg-paid-soft text-paid-ink rounded-full text-kicker font-black tracking-wider uppercase shrink-0">
          Ready
        </span>
      )}
    </div>
  );
}
