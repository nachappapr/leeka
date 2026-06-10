import type { Metadata } from "next";

import { ReportsContainer } from "@/components/reports/reports-container";

export const metadata: Metadata = {
  title: "Reports — ArthaPatra",
  description: "Business analytics, payment trends, and GST summaries.",
};

export default function ReportsPage() {
  return <ReportsContainer />;
}
