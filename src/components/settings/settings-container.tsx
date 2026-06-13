"use client";

import type React from "react";
import { useState } from "react";

import { Topbar } from "@/components/ui/custom/topbar";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { PageHeader } from "@/components/ui/custom/page-header";
import { SettingsSectionTabs } from "@/components/settings/settings-section-tabs";
import { SettingsSectionAside } from "@/components/settings/settings-section-aside";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { LanguageSection } from "@/components/settings/language-section";
import { ItemsSection } from "@/components/settings/items-section";
import type { SettingsSectionId } from "@/lib/types/settings";

interface SettingsContainerProps {
  notificationsSlot?: React.ReactNode;
  businessSlot?: React.ReactNode;
  templateSlot?: React.ReactNode;
  taxSlot?: React.ReactNode;
  planSlot?: React.ReactNode;
}

export function SettingsContainer({
  notificationsSlot,
  businessSlot,
  templateSlot,
  taxSlot,
  planSlot,
}: SettingsContainerProps) {
  const [section, setSection] = useState<SettingsSectionId>("business");

  return (
    <div className="flex flex-1 flex-col">
      <Topbar
        title="Settings"
        subtitle="Manage business profile & preferences"
        notificationsSlot={notificationsSlot}
      />

      <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
        <h1 className="sr-only">Settings</h1>

        <PageHeader
          title="Settings"
          subtitle="Manage your business profile, invoice template, and preferences."
          className="max-mobile:hidden"
        />

        <SettingsSectionTabs activeSection={section} onSectionChange={setSection} />

        <div className="grid items-start gap-5 min-mobile:grid-cols-[240px_1fr]">
          <SettingsSectionAside activeSection={section} onSectionChange={setSection} />

          <div className="flex flex-col gap-4" aria-live="polite">
            {section === "business" && businessSlot}
            {section === "template" && templateSlot}
            {section === "tax" && taxSlot}
            {section === "notifications" && <NotificationsSection />}
            {section === "language" && <LanguageSection />}
            {section === "plan" && planSlot}
            {section === "items" && <ItemsSection />}
          </div>
        </div>
      </div>

      <MobileTabBar />
    </div>
  );
}
