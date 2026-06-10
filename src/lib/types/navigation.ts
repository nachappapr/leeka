import type React from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
  /** Renders as the primary (coral FAB) action in the mobile tab bar */
  isPrimary?: boolean;
  /** Include this item in the mobile tab bar */
  inMobileTab?: boolean;
  /** Belongs to the Account section of the sidebar (Settings, Help) */
  isAccount?: boolean;
}
