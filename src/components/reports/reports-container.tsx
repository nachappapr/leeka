import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { ReportsRangeChips } from "@/components/reports/reports-range-chips";
import { ReportsMetricCard } from "@/components/reports/reports-metric-card";
import { ReportsChartLazy } from "@/components/reports/reports-chart-lazy";
import { ReportsChartTable } from "@/components/reports/reports-chart-table";
import { ReportsEmptyState } from "@/components/reports/reports-empty-state";
import { getReportsMetrics } from "@/lib/data/reports";
import { computeDateRange } from "@/lib/constants/reports";
import { formatPaise } from "@/lib/utils";
import type { RangeId } from "@/lib/types/reports";

interface ReportsContainerProps {
  rangeId: RangeId;
}

function formatDaysToPayValue(avgDays: number | null): {
  display: string;
  srContext: string | undefined;
} {
  if (avgDays === null) {
    return { display: "—", srContext: "No data available" };
  }
  return { display: `${avgDays.toFixed(1)} days`, srContext: undefined };
}

function isEmptyData(
  invoiceCount: number,
  months: Array<{ revenue: number; received: number }>,
): boolean {
  if (invoiceCount > 0) return false;
  return months.every((m) => m.revenue === 0 && m.received === 0);
}

export async function ReportsContainer({ rangeId }: ReportsContainerProps) {
  const { from, to, label: rangeLabel } = computeDateRange(rangeId);

  const metrics = await getReportsMetrics(from, to);

  const summary = metrics?.summary ?? {
    revenue: 0,
    received: 0,
    invoice_count: 0,
    avg_invoice_value: 0,
    avg_days_to_pay: null,
  };
  const months = metrics?.months ?? [];

  const empty = isEmptyData(summary.invoice_count, months);

  const daysToPayFormatted = formatDaysToPayValue(summary.avg_days_to_pay);

  return (
    <div className="flex flex-1 flex-col">
      <Topbar title="Reports" subtitle={rangeLabel} notificationsSlot={<TopbarNotifications />} />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <div className="overflow-x-auto scrollbar-none">
          <ReportsRangeChips selected={rangeId} />
        </div>

        <section
          className="grid grid-cols-4 gap-4 max-tablet:grid-cols-2 max-mobile:grid-cols-2 max-mobile:gap-3"
          aria-label="Summary metrics"
        >
          <ReportsMetricCard label="Revenue billed" value={formatPaise(summary.revenue)} />
          <ReportsMetricCard label="Received" value={formatPaise(summary.received)} />
          <ReportsMetricCard
            label="Avg invoice value"
            value={summary.invoice_count === 0 ? "—" : formatPaise(summary.avg_invoice_value)}
            srContext={summary.invoice_count === 0 ? "No data available" : undefined}
          />
          <ReportsMetricCard
            label="Avg time to pay"
            value={daysToPayFormatted.display}
            srContext={daysToPayFormatted.srContext}
          />
        </section>

        <section aria-label={empty ? undefined : "Monthly trends"}>
          {empty ? (
            <ReportsEmptyState />
          ) : (
            <>
              <h2 className="sr-only">Monthly trends</h2>
              <ReportsChartTable months={months} />
              <ReportsChartLazy months={months} />
            </>
          )}
        </section>
      </div>

      <MobileTabBar />
    </div>
  );
}
