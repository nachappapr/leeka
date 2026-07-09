"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/custom/skeleton";
import type { ReportsMonthPoint } from "@/lib/types/reports";

const ReportsChartDynamic = dynamic(() => import("./reports-chart").then((m) => m.ReportsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-108 w-full rounded-xl max-mobile:h-78" />,
});

interface ReportsChartLazyProps {
  months: ReportsMonthPoint[];
}

export function ReportsChartLazy({ months }: ReportsChartLazyProps) {
  return <ReportsChartDynamic months={months} />;
}
