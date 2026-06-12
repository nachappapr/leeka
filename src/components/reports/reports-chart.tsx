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
import type { ReportsMonthPoint } from "@/lib/types/reports";

interface ReportsChartProps {
  months: ReportsMonthPoint[];
}

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function formatPaiseTooltip(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const REVENUE_COLOR = "var(--color-chart-1)";
const RECEIVED_COLOR = "var(--color-chart-2)";

export function ReportsChart({ months }: ReportsChartProps) {
  const data = months.map((m) => ({
    name: formatMonthLabel(m.month),
    Revenue: m.revenue,
    Received: m.received,
  }));

  return (
    <div className="w-full">
      <div aria-hidden="true">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 8, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--color-ink-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => (v === 0 ? "0" : `₹${(v / 100 / 1000).toFixed(0)}k`)}
              tick={{ fontSize: 11, fill: "var(--color-ink-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              animationDuration={0}
              formatter={(value, name) => [
                typeof value === "number" ? formatPaiseTooltip(value) : String(value),
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
            <Bar dataKey="Revenue" fill={REVENUE_COLOR} radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Received" fill={RECEIVED_COLOR} radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
