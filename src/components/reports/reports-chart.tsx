"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/custom/card";
import type { ReportsMonthPoint } from "@/lib/types/reports";
import { formatPaiseAxisTick, formatPaiseFull, shapeChartSeries } from "@/lib/reports/chart-format";

interface ReportsChartProps {
  months: ReportsMonthPoint[];
}

const REVENUE_COLOR = "var(--color-chart-1)";
const RECEIVED_COLOR = "var(--color-chart-2)";

export function ReportsChart({ months }: ReportsChartProps) {
  const data = shapeChartSeries(months);

  return (
    <Card>
      <div aria-hidden="true" className="h-100 p-4 max-mobile:h-72 max-mobile:p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-line)" />
            {/* Two x-axes over the same category band: each Bar centers in the full
                band on its own axis, so Received overlaps in front of Revenue and a
                revenue-only month still renders one centered bar. */}
            <XAxis
              dataKey="label"
              xAxisId="back"
              tick={{ fontSize: 12, fill: "var(--color-ink-3)", fontFamily: "inherit" }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <XAxis dataKey="label" xAxisId="front" hide />
            <YAxis
              tickCount={4}
              tickFormatter={formatPaiseAxisTick}
              tick={{ fontSize: 12, fill: "var(--color-ink-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              animationDuration={0}
              formatter={(value, name) => [
                typeof value === "number" ? formatPaiseFull(value) : String(value),
                String(name),
              ]}
              contentStyle={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-line)",
                background: "var(--color-surface)",
                fontSize: 13,
                fontFamily: "inherit",
                color: "var(--color-ink)",
              }}
              cursor={{ fill: "var(--color-line)", opacity: 0.5 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, fontFamily: "inherit", color: "var(--color-ink-2)" }}
            />
            <Bar
              dataKey="revenue"
              name="Revenue"
              xAxisId="back"
              fill={REVENUE_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="received"
              name="Received"
              xAxisId="front"
              fill={RECEIVED_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
