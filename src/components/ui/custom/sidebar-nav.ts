import {
  Asterisk,
  Bell,
  FileText,
  Home,
  Info,
  Plus,
  Settings,
  Users,
} from "@/components/icons";

export const NAV_MAIN = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    badge: undefined as number | undefined,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
    badge: 3 as number | undefined,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Bell,
    badge: undefined as number | undefined,
  },
  {
    label: "New invoice",
    href: "/invoices/new",
    icon: Plus,
    badge: undefined as number | undefined,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    badge: undefined as number | undefined,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: Asterisk,
    badge: undefined as number | undefined,
  },
];

export const NAV_ACCOUNT = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help", href: "/dashboard/help", icon: Info },
];
