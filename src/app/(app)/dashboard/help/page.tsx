import type { Metadata } from "next";

import { DashboardHelpContainer } from "@/components/dashboard-help/dashboard-help-container";

export const metadata: Metadata = {
  title: "Help — ArthaPatra",
  description: "Guides, FAQs, and support resources.",
};

export default function DashboardHelpPage() {
  return <DashboardHelpContainer />;
}
