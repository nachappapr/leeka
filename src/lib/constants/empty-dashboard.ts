import type { SetupStep, PreviewTile, QuickAction } from "@/lib/types/empty-dashboard"

export const SETUP_STEPS: ReadonlyArray<SetupStep> = [
  {
    key: "profile",
    done: true,
    label: "Business profile created",
    hint: "Raj Kumar Trading · GSTIN 07AAACR1234A1Z5",
    action: { label: "View", href: "/settings" },
  },
  {
    key: "customer",
    done: false,
    label: "Add your first customer",
    hint: "Name + phone is enough. You can fill in GSTIN & address later.",
    action: { label: "Add customer", href: "/customers", primary: true },
  },
  {
    key: "invoice",
    done: false,
    label: "Create your first invoice",
    hint: "We'll save it as a draft until you're ready to send.",
    action: { label: "Start invoice", href: "/invoices/new" },
  },
  {
    key: "paid",
    done: false,
    label: "Get paid · UPI or WhatsApp",
    hint: "Your customer pays with one tap. We mark it paid for you.",
    action: null,
  },
]

export const PREVIEW_TILES: ReadonlyArray<PreviewTile> = [
  {
    icon: "IndianRupee",
    label: "Total outstanding",
    hint: "Money awaited across all customers",
    bgClass: "bg-coral-soft",
    inkClass: "text-coral-ink",
  },
  {
    icon: "Check",
    label: "Received this month",
    hint: "Add up to a real number once you're paid",
    bgClass: "bg-paid-soft",
    inkClass: "text-paid-ink",
  },
  {
    icon: "Clock",
    label: "Overdue",
    hint: "We'll nudge customers for you on WhatsApp",
    bgClass: "bg-overdue-soft",
    inkClass: "text-overdue-ink",
  },
]

export const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  {
    icon: "Receipt",
    title: "See a sample invoice",
    sub: "Preview the layout your customers will receive.",
    href: "/invoices/new",
    bgClass: "bg-coral-soft",
    inkClass: "text-coral-ink",
  },
  {
    icon: "Users",
    title: "Import from contacts",
    sub: "Add your regulars in bulk from your phone book.",
    href: "/customers",
    bgClass: "bg-info-soft",
    inkClass: "text-info",
  },
  {
    icon: "WhatsApp",
    title: "Set up UPI & WhatsApp",
    sub: "So customers can pay you with a single tap.",
    href: "/settings",
    bgClass: "bg-whatsapp-soft",
    inkClass: "text-whatsapp",
  },
]
