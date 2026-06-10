import * as React from "react";

import { Eye, Plus, WhatsApp } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";

interface ActivityEntry {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  meta: string;
  isoDateTime: string;
}

// Static activity timeline — replace with real data once the activity feed
// API ships.
const ENTRIES: ReadonlyArray<ActivityEntry> = [
  {
    icon: <WhatsApp aria-hidden />,
    iconBg: "bg-whatsapp-soft",
    iconColor: "text-whatsapp-icon",
    title: "Sent on WhatsApp",
    meta: "Today, 11:24 AM",
    isoDateTime: "2026-05-26T11:24",
  },
  {
    icon: <Eye className="size-4.5" aria-hidden />,
    iconBg: "bg-info-soft",
    iconColor: "text-info",
    title: "Viewed by customer",
    meta: "Today, 12:08 PM",
    isoDateTime: "2026-05-26T12:08",
  },
  {
    icon: <Plus className="size-4.5" aria-hidden />,
    iconBg: "bg-coral-soft",
    iconColor: "text-coral-press",
    title: "Invoice created",
    meta: "Today, 11:21 AM",
    isoDateTime: "2026-05-26T11:21",
  },
];

function TimelineRow({ entry }: { entry: ActivityEntry }) {
  return (
    <li className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-nav-item ${entry.iconBg} ${entry.iconColor}`}
      >
        {entry.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-bold text-ink">{entry.title}</div>
        <time dateTime={entry.isoDateTime} className="text-label text-ink-3">
          {entry.meta}
        </time>
      </div>
    </li>
  );
}

export function InvoiceActivityCard() {
  return (
    <Card title="Activity" headingLevel={3}>
      <ol aria-label="Invoice activity" className="px-6 py-1">
        {ENTRIES.map((entry) => (
          <TimelineRow key={entry.title} entry={entry} />
        ))}
      </ol>
    </Card>
  );
}
