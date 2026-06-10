import { ShoppingBag, Sparkles, Package, Receipt } from "@/components/icons";

const TRUST_MARKS = [
  "Free for the first 10 invoices a month",
  "No card. No install. Works in any browser.",
  "GST-ready · English & हिंदी",
] as const;

const BIZ_TYPES = [
  { id: "retail", label: "Retail / shop", Icon: ShoppingBag },
  { id: "services", label: "Services", Icon: Sparkles },
  { id: "wholesale", label: "Wholesale", Icon: Package },
  { id: "food", label: "Food & catering", Icon: Receipt },
] as const;

type BizTypeId = (typeof BIZ_TYPES)[number]["id"];

export { TRUST_MARKS, BIZ_TYPES };
export type { BizTypeId };
