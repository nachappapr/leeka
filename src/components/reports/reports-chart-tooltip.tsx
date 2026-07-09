import type { TooltipContentProps } from "recharts";

import { CHART_SERIES, formatPaiseFull } from "@/lib/reports/chart-format";

export function ReportsChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="min-w-32 rounded-lg border border-line bg-surface px-3 py-2 shadow-float">
      <p className="text-label font-semibold text-ink-3">{label}</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {CHART_SERIES.map((series) => {
          const value = payload.find((entry) => entry.dataKey === series.key)?.value;
          if (typeof value !== "number") return null;
          return (
            <p
              key={series.key}
              className="flex items-baseline justify-between gap-4 text-caption text-ink-2"
            >
              {series.name}
              <span className="tabular font-bold text-ink">{formatPaiseFull(value)}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
