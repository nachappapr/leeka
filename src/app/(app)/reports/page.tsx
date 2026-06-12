import type { Metadata } from "next";

import { ReportsContainer } from "@/components/reports/reports-container";
import { DEFAULT_RANGE_ID } from "@/lib/constants/reports";
import type { RangeId } from "@/lib/types/reports";

export const metadata: Metadata = {
  title: "Reports — ArthaPatra",
  description: "Business analytics, payment trends, and GST summaries.",
};

const VALID_RANGE_IDS: RangeId[] = ["3M", "6M", "12M", "FY"];

function isRangeId(v: unknown): v is RangeId {
  return VALID_RANGE_IDS.includes(v as RangeId);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { range } = await searchParams;
  const rangeId = isRangeId(range) ? range : DEFAULT_RANGE_ID;
  return <ReportsContainer rangeId={rangeId} />;
}
