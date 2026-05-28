import {
  WhatsApp,
  CheckCircle2,
  Bell,
  Receipt,
  Monitor,
} from "@/components/icons"
import { StepIlSearch } from "@/components/home/step-il-search"
import { StepIlItems } from "@/components/home/step-il-items"
import { StepIlSend } from "@/components/home/step-il-send"

import type {
  Feature,
  Step,
  Testimonial,
  PricingPlan,
  Faq,
  FooterNavGroup,
  FooterLang,
  TrustItem,
  HeroMetaItem,
} from "@/lib/types/home"

export const FEATURES: Feature[] = [
  {
    id: "whatsapp-first",
    icon: WhatsApp,
    title: "WhatsApp-first sending",
    description:
      "Skip the email back-and-forth. Tap once and your invoice lands in your customer’s WhatsApp — read receipts and all. They can pay in the same chat.",
    tone: "lg",
  },
  {
    id: "mark-as-paid",
    icon: CheckCircle2,
    title: "One-click \"Mark as paid\"",
    description:
      "Cash, UPI, bank or other — record any payment method in two clicks. ArthaPatra keeps the ledger straight.",
  },
  {
    id: "gentle-reminders",
    icon: Bell,
    title: "Gentle reminders",
    description:
      "ArthaPatra nudges your customer politely over WhatsApp before things get awkward. You stay friends, you get paid.",
  },
  {
    id: "gst-ready",
    icon: Receipt,
    title: "GST-ready",
    description:
      "Add your GSTIN once, tag CGST/SGST per item, export GSTR-1 — without learning a single tax form.",
  },
  {
    id: "open-in-any-browser",
    icon: Monitor,
    title: "Open in any browser",
    description:
      "Nothing to install. Sign in on your phone in the morning, switch to your laptop in the afternoon — everything stays in sync. Works on Chrome, Safari, Edge and even older Android browsers.",
  },
]

export const STEPS: Step[] = [
  {
    id: "step-1",
    n: 1,
    title: "Pick a customer",
    description:
      "Choose someone from your saved list, or add a new one with just their name and phone number. We remember the rest.",
    illustration: StepIlSearch,
  },
  {
    id: "step-2",
    n: 2,
    title: "Add what you sold",
    description:
      "Item name, quantity, price. The total updates live. Add GST with one toggle if you need it.",
    illustration: StepIlItems,
  },
  {
    id: "step-3",
    n: 3,
    title: "Send on WhatsApp",
    description:
      "One tap. Your customer gets a professional invoice they can pay right away. You get a notification when it’s viewed.",
    illustration: StepIlSend,
  },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "sandeep-kapoor",
    quote:
      "“Pehle main bills haath se likhta tha. Ab WhatsApp pe bhej deta hoon — paisa bhi jaldi aata hai. ArthaPatra ne kaam aasaan kar diya.”",
    author: "Sandeep Kapoor",
    role: "Kirana store",
    location: "Lucknow",
    rating: 5,
    initials: "SK",
  },
  {
    id: "priya-menon",
    quote:
      "“I bake cakes from home and was juggling Excel sheets. ArthaPatra tracks everything for me — and the WhatsApp send is genius. My customers love the friendly tone.”",
    author: "Priya Menon",
    role: "Home baker",
    location: "Bengaluru",
    rating: 5,
    initials: "PM",
  },
  {
    id: "imran-ahmed",
    quote:
      "“Mark as paid in one tap is what won me over. I take 80% cash payments — ArthaPatra was the only app that didn’t make me feel like an idiot for not using UPI all the time.”",
    author: "Imran Ahmed",
    role: "Tailor",
    location: "Hyderabad",
    rating: 5,
    initials: "IA",
  },
]

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Free forever",
    price: "₹0",
    period: "/ month",
    features: [
      "Up to 10 invoices per month",
      "Send on WhatsApp & email",
      "Customer & item library",
      "Mark as paid · 4 payment methods",
      "English + 5 Indian languages",
    ],
    ctaLabel: "Get started free",
    ctaHref: "/auth?mode=signup",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Most popular",
    price: "₹99",
    period: "/ month",
    features: [
      "Unlimited invoices",
      "Auto WhatsApp payment reminders",
      "GST reports & one-click export",
      "Custom invoice templates & branding",
      "Priority Hindi & English support",
    ],
    ctaLabel: "Start 14-day free trial",
    ctaHref: "/auth?mode=signup",
    highlighted: true,
  },
]

export const FAQS: Faq[] = [
  {
    id: "is-it-free",
    question: "Is it really free?",
    answer:
      "Yes — the Starter plan is free forever. You can send up to 10 invoices a month, save unlimited customers, and use every core feature. If you outgrow that, Pro is ₹99/month. We won’t show you upgrade pop-ups every 2 minutes.",
  },
  {
    id: "customers-need-app",
    question: "Do my customers need to download the app?",
    answer:
      "Nope. They get a regular WhatsApp message with the invoice — they can view it, save the PDF, and pay you back in the same chat. No app installs, no accounts, no friction.",
  },
  {
    id: "works-on-my-phone",
    question: "Will it work on my phone?",
    answer:
      "Yes — ArthaPatra runs in any modern phone browser. Open app.arthapatra.in on Chrome, Safari, or your default browser. The layout adapts to phone, tablet and desktop, so the same account works everywhere. No app store, no install.",
  },
  {
    id: "bad-internet",
    question: "What if my internet is bad?",
    answer:
      "ArthaPatra caches the app once you’ve opened it, so the interface keeps working on slow or patchy connections. Drafts you create offline sync up the moment you’re back online — nothing is lost. We test on 2G in real Indian cities.",
  },
  {
    id: "gst-supported",
    question: "Is GST supported?",
    answer:
      "Yes. Add your GSTIN once, set default CGST/SGST/IGST rates, and ArthaPatra handles per-item tax calculation. On the Pro plan, you can export GSTR-1-ready reports.",
  },
  {
    id: "my-data",
    question: "What about my data?",
    answer:
      "Your data is yours. We store it encrypted, on servers in India. We never sell it, never share it with advertisers. You can export everything (or delete everything) anytime from Settings.",
  },
]

export const FOOTER_NAV: FooterNavGroup[] = [
  {
    id: "product",
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "Open the app", href: "/auth" },
    ],
  },
  {
    id: "company",
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    id: "help",
    heading: "Help",
    links: [
      { label: "Documentation", href: "#" },
      { label: "FAQ", href: "#faq" },
      { label: "WhatsApp us", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
]

export const FOOTER_LANGS: FooterLang[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "ta", label: "தமிழ்" },
  { code: "bn", label: "বাংলা" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "mr", label: "मराठी" },
]

export const TRUST_ITEMS: TrustItem[] = [
  {
    id: "shop-owners",
    kind: "emphasis",
    emphasis: "10,400+",
    label: " shop owners trust ArthaPatra",
  },
  {
    id: "play-store-rating",
    kind: "rating",
    rating: 4.8,
    outOf: 5,
    label: "average review",
  },
  {
    id: "monthly-invoiced",
    kind: "emphasis",
    emphasis: "₹12 Cr+",
    label: " invoiced last month",
  },
  {
    id: "made-in-india",
    kind: "flag",
    label: "Made in India",
  },
]

export const HERO_META: HeroMetaItem[] = [
  { id: "no-card", label: "No install, no credit card" },
  { id: "cross-device", label: "Works on phone & desktop" },
  { id: "gst", label: "GST-ready" },
]

export const CTA_BAND = {
  headlineLine1: "Stop chasing payments.",
  headlineLine2: "Start running your shop.",
  body: "Join 10,400+ vendors who get paid faster, on WhatsApp, with ArthaPatra.",
  primaryCta: { label: "Sign up free", href: "/auth?mode=signup" },
  secondaryCta: { label: "Log in", href: "/auth" },
} as const
