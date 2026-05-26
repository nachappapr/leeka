import {
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
} from "@/components/icons"
import type { MobileTab } from "@/lib/types"

export const MOBILE_TABS: ReadonlyArray<MobileTab> = [
  { label: "Home",      icon: LayoutDashboard, href: "/dashboard",           active: true },
  { label: "Invoices",  icon: FileText,        href: "/dashboard/invoices"               },
  { label: "",          icon: Plus,            href: "/new",                 isPrimary: true },
  { label: "Customers", icon: Users,           href: "/dashboard/customers"              },
  { label: "Settings",  icon: Settings,        href: "/dashboard/settings"               },
]
