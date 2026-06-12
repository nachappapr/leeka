import type { Metadata } from "next";

import { SettingsContainer } from "@/components/settings/settings-container";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";

export const metadata: Metadata = {
  title: "Settings — ArthaPatra",
  description: "Manage your business profile, invoice template, and preferences.",
};

export default function SettingsPage() {
  return <SettingsContainer notificationsSlot={<TopbarNotifications />} />;
}
