import type { Metadata } from "next";

import { SettingsContainer } from "@/components/settings/settings-container";

export const metadata: Metadata = {
  title: "Settings — ArthaPatra",
  description: "Manage your business profile, invoice template, and preferences.",
};

export default function SettingsPage() {
  return <SettingsContainer />;
}
