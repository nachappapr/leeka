import type { ActivityKind, InvoiceActivityItem } from "@/lib/types/invoice";

interface InvoiceEventRow {
  id: string;
  type: string;
  channel: string | null;
  created_at: string | null;
}

function normalizeChannel(raw: string | null): "whatsapp" | "email" | null {
  if (raw === "whatsapp") return "whatsapp";
  if (raw === "email") return "email";
  return null;
}

function humanize(type: string): string {
  return type
    .split(/[._]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildKindAndLabel(
  type: string,
  channel: "whatsapp" | "email" | null,
): { kind: ActivityKind; label: string } {
  switch (type) {
    case "whatsapp.dispatched":
      return { kind: "sent", label: "Sent on WhatsApp" };
    case "email.dispatched":
      return { kind: "sent", label: "Sent over email" };
    case "viewed":
      if (channel === "whatsapp") return { kind: "viewed", label: "Viewed on WhatsApp" };
      if (channel === "email") return { kind: "viewed", label: "Viewed via email" };
      return { kind: "viewed", label: "Viewed by customer" };
    case "reminder_sent":
      if (channel === "whatsapp") return { kind: "reminder", label: "Reminder sent on WhatsApp" };
      if (channel === "email") return { kind: "reminder", label: "Reminder sent via email" };
      return { kind: "reminder", label: "Reminder sent" };
    case "paid":
      return { kind: "paid", label: "Marked paid" };
    case "overdue":
      return { kind: "overdue", label: "Marked overdue" };
    case "unpaid":
      return { kind: "unpaid", label: "Marked unpaid" };
    default:
      return { kind: "other", label: humanize(type) };
  }
}

export function mapActivityEvent(event: InvoiceEventRow): InvoiceActivityItem {
  const channel = normalizeChannel(event.channel);
  const { kind, label } = buildKindAndLabel(event.type, channel);
  return {
    id: event.id,
    kind,
    label,
    channel,
    isoDateTime: event.created_at ?? "",
  };
}

export function mapActivityTimeline(
  events: ReadonlyArray<InvoiceEventRow> | null | undefined,
): InvoiceActivityItem[] {
  if (!events?.length) return [];
  return [...events]
    .sort((a, b) => {
      const tDiff = (b.created_at ?? "").localeCompare(a.created_at ?? "");
      if (tDiff !== 0) return tDiff;
      // Stable tiebreaker on equal timestamps prevents nondeterministic reordering
      return b.id.localeCompare(a.id);
    })
    .map(mapActivityEvent);
}
