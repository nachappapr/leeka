import type { Metadata } from "next";

import { SettingsContainer } from "@/components/settings/settings-container";
import { TopbarNotifications } from "@/components/ui/custom/topbar-notifications";
import { BusinessSection } from "@/components/settings/business-section";
import { TemplateSection } from "@/components/settings/template-section";
import { TaxSection } from "@/components/settings/tax-section";

export const metadata: Metadata = {
  title: "Settings — ArthaPatra",
  description: "Manage your business profile, invoice template, and preferences.",
};

export default function SettingsPage() {
  return (
    <SettingsContainer
      notificationsSlot={<TopbarNotifications />}
      businessSlot={<BusinessSection />}
      templateSlot={<TemplateSection />}
      taxSlot={<TaxSection />}
    />
  );
}
