import { CHART_SERIES } from "@/lib/reports/chart-format";
import type { ChartSeriesDef } from "@/lib/reports/chart-format";

const DOT_CLASS: Record<ChartSeriesDef["key"], string> = {
  revenue: "bg-chart-1",
  received: "bg-chart-2",
};

export function ReportsChartLegend() {
  return (
    <div className="flex items-center justify-end gap-4">
      {CHART_SERIES.map((series) => (
        <span
          key={series.key}
          className="flex items-center gap-1.5 text-caption font-semibold text-ink-2"
        >
          <span className={`size-2 rounded-full ${DOT_CLASS[series.key]}`} />
          {series.name}
        </span>
      ))}
    </div>
  );
}
