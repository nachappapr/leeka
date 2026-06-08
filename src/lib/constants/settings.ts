import {
  Bell,
  ImageIcon,
  IndianRupee,
  Languages,
  ShoppingBag,
  Sparkles,
} from "@/components/icons"
import type { SettingsSectionDef, LanguageOption } from "@/lib/types/settings"

export const SETTINGS_SECTIONS: ReadonlyArray<SettingsSectionDef> = [
  { id: "business",      icon: ShoppingBag, label: "Business profile" },
  { id: "template",      icon: ImageIcon,   label: "Invoice template" },
  { id: "tax",           icon: IndianRupee, label: "Tax & GST" },
  { id: "notifications", icon: Bell,        label: "Notifications" },
  { id: "language",      icon: Languages,   label: "Language" },
  { id: "plan",          icon: Sparkles,    label: "Plan & billing" },
]

// Raw hex rendered via a data-driven CSS var in accent-swatch.tsx (no semantic token covers these).
export const SETTINGS_ACCENTS: ReadonlyArray<string> = [
  "#F46A39",
  "#0E8F8A",
  "#7A4FCC",
  "#E85D5D",
  "#1F9D55",
  "#1F1A14",
]

export const SETTINGS_LANGUAGES: ReadonlyArray<LanguageOption> = [
  { id: "en", label: "English",   sub: "English"  },
  { id: "hi", label: "हिंदी",     sub: "Hindi",   lang: "hi" },
  { id: "ta", label: "தமிழ்",     sub: "Tamil",   lang: "ta" },
  { id: "mr", label: "मराठी",     sub: "Marathi", lang: "mr" },
  { id: "bn", label: "বাংলা",     sub: "Bengali", lang: "bn" },
  { id: "gu", label: "ગુજરાતી",   sub: "Gujarati",lang: "gu" },
]

export const SETTINGS_TAX_TOGGLES: ReadonlyArray<{ id: string; label: string; defaultOn: boolean }> = [
  { id: "include-gst",    label: "Include GST by default on new invoices", defaultOn: true  },
  { id: "show-hsn",       label: "Show HSN/SAC code field",                defaultOn: false },
  { id: "tax-shipping",   label: "Apply tax to shipping",                  defaultOn: false },
]

export const SETTINGS_NOTIFICATION_TOGGLES: ReadonlyArray<{ id: string; label: string; defaultOn: boolean }> = [
  { id: "wa-receipts",    label: "WhatsApp delivery receipts",                defaultOn: true  },
  { id: "push-viewed",    label: "Push when an invoice is viewed",            defaultOn: true  },
  { id: "push-paid",      label: "Push when payment is received",             defaultOn: true  },
  { id: "daily-email",    label: "Daily summary email",                       defaultOn: false },
  { id: "auto-reminders", label: "Auto-send reminders for overdue invoices",  defaultOn: true  },
]

export const SETTINGS_PLAN_FEATURES: ReadonlyArray<string> = [
  "Unlimited invoices",
  "Auto WhatsApp reminders",
  "GST reports & export",
  "Priority Hindi support",
]
