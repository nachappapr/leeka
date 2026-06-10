import { Asterisk, Bell, FileText, Home, Info, Plus, Settings, Users } from "@/components/icons";
import type { NavItem } from "@/lib/types/navigation";

/**
 * Single source of truth for all app navigation.
 *
 * Sidebar derives NAV_MAIN and NAV_ACCOUNT by filtering isAccount.
 * Mobile tab bar derives its items by filtering inMobileTab === true.
 */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    inMobileTab: true,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
    badge: 3,
    inMobileTab: true,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Bell,
  },
  {
    label: "New invoice",
    href: "/invoices/new",
    icon: Plus,
    inMobileTab: true,
    isPrimary: true,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    inMobileTab: true,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Asterisk,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    inMobileTab: true,
    isAccount: true,
  },
  {
    label: "Help",
    href: "/dashboard/help",
    icon: Info,
    isAccount: true,
  },
];

/** Main sidebar section (non-account items) */
export const NAV_MAIN = NAV_ITEMS.filter((item) => !item.isAccount);

/** Account sidebar section (Settings, Help) */
export const NAV_ACCOUNT = NAV_ITEMS.filter((item) => item.isAccount);

/** Mobile tab bar items — ordered subset, primary action included */
export const MOBILE_TABS = NAV_ITEMS.filter((item) => item.inMobileTab);
