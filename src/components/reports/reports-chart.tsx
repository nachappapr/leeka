"use client";

import { useSyncExternalStore } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/custom/card";
import { ReportsChartLegend } from "@/components/reports/reports-chart-legend";
import { ReportsChartTooltip } from "@/components/reports/reports-chart-tooltip";
import type { ReportsMonthPoint } from "@/lib/types/reports";
import { formatPaiseAxisTick, shapeChartSeries } from "@/lib/reports/chart-format";

interface ReportsChartProps {
  months: ReportsMonthPoint[];
}

const REVENUE_COLOR = "var(--color-chart-1)";
const RECEIVED_COLOR = "var(--color-chart-2)";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function readReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function ReportsChart({ months }: ReportsChartProps) {
  const data = shapeChartSeries(months);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  return (
    <Card>
      <div aria-hidden="true" className="flex flex-col gap-3 p-4 max-mobile:p-3">
        <ReportsChartLegend />
        <div className="h-92 max-mobile:h-64">
          <ResponsiveContainer width="100%" height="100%">
            {/* accessibilityLayer off: recharts' default puts a tabbable
                role="application" svg inside this aria-hidden region; the
                sr-only table is the canonical accessible representation. */}
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              accessibilityLayer={false}
            >
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
                content={ReportsChartTooltip}
                cursor={{ fill: "var(--color-line)", opacity: 0.5 }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                xAxisId="back"
                fill={REVENUE_COLOR}
                isAnimationActive={!reducedMotion}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Bar
                dataKey="received"
                name="Received"
                xAxisId="front"
                fill={RECEIVED_COLOR}
                isAnimationActive={!reducedMotion}
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
