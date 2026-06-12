import type React from "react";

import { MobileMenuButton } from "@/components/ui/custom/mobile-menu-button";
import { MobileSearchTrigger } from "@/components/ui/custom/mobile-search-trigger";
import { SearchPalette } from "@/components/ui/custom/search-palette";

interface TopbarProps {
  title: string;
  subtitle?: string;
  /** Mobile-only action slot — rendered after the notifications slot in the right cluster */
  actions?: React.ReactNode;
  /** Notifications bell slot — pass <TopbarNotifications /> from server component parents */
  notificationsSlot?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions, notificationsSlot }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-border bg-background/85 px-7 py-3.5 backdrop-blur-md backdrop-saturate-150 max-mobile:flex max-mobile:gap-2.5 max-mobile:px-4 max-mobile:py-3">
      <MobileMenuButton />

      <div className="min-w-0 max-mobile:flex-1">
        <h1 className="truncate text-title font-black text-ink">{title}</h1>
        {subtitle && <p className="truncate text-label font-semibold text-ink-3">{subtitle}</p>}
      </div>

      <div className="flex items-center justify-center max-mobile:hidden">
        <SearchPalette />
      </div>

      <div className="flex items-center justify-end gap-2 max-mobile:ml-auto">
        <MobileSearchTrigger />
        {notificationsSlot}
        {actions}
      </div>
    </header>
  );
}
