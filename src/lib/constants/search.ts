import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

export type JumpItem = {
  filter: StatusPillStatus | "sent";
  label: string;
  sub: (count: number) => string;
  color: string;
};

export const JUMP_ITEMS: ReadonlyArray<JumpItem> = [
  {
    filter: "overdue",
    label: "Overdue",
    sub: (n) => `${n} invoice${n === 1 ? "" : "s"}`,
    color: "var(--color-overdue)",
  },
  {
    filter: "sent",
    label: "Awaiting",
    sub: (n) => `${n} sent`,
    color: "var(--color-pending)",
  },
  {
    filter: "draft",
    label: "Drafts",
    sub: (n) => `${n} unsent`,
    color: "var(--color-draft)",
  },
  {
    filter: "paid",
    label: "Paid",
    sub: (n) => `${n} receipts`,
    color: "var(--color-paid)",
  },
];
