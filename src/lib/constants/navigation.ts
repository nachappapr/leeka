import {
  FileText,
  Home,
  Plus,
  Settings,
  Users,
} from "@/components/icons"
import type { MobileTab } from "@/lib/types"

export const MOBILE_TABS: ReadonlyArray<MobileTab> = [
  { label: "Home",      icon: Home,            href: "/dashboard"                          },
  { label: "Invoices",  icon: FileText,        href: "/invoices"                           },
  { label: "",          icon: Plus,            href: "/invoices/new",        isPrimary: true },
  { label: "Customers", icon: Users,           href: "/customers"                          },
  { label: "Settings",  icon: Settings,        href: "/settings"                           },
]
