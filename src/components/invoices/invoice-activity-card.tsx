import * as React from "react";

import { Bell, Check, Clock, Eye, Info, Mail } from "@/components/icons";
import { WhatsApp } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { cn } from "@/lib/utils";
import type { InvoiceActivityItem } from "@/lib/types/invoice";

function formatEventTime(isoDateTime: string): string {
  if (!isoDateTime) return "";
  const date = new Date(isoDateTime);
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}

type IconPresentation = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
};

function resolvePresentation(item: InvoiceActivityItem): IconPresentation {
  if (item.channel === "whatsapp" && (item.kind === "sent" || item.kind === "viewed")) {
    return { Icon: WhatsApp, iconBg: "bg-whatsapp-soft", iconColor: "text-whatsapp-icon" };
  }
  if (item.channel === "email" && (item.kind === "sent" || item.kind === "viewed")) {
    return { Icon: Mail, iconBg: "bg-info-soft", iconColor: "text-info" };
  }
  switch (item.kind) {
    case "sent":
      return { Icon: Mail, iconBg: "bg-info-soft", iconColor: "text-info" };
    case "viewed":
      return { Icon: Eye, iconBg: "bg-info-soft", iconColor: "text-info" };
    case "reminder":
      return { Icon: Bell, iconBg: "bg-coral-soft", iconColor: "text-coral-press" };
    case "paid":
      return { Icon: Check, iconBg: "bg-paid-soft", iconColor: "text-paid-ink" };
    case "overdue":
      return { Icon: Clock, iconBg: "bg-overdue-soft", iconColor: "text-overdue-ink" };
    default:
      return { Icon: Info, iconBg: "bg-draft-soft", iconColor: "text-draft-ink" };
  }
}

function TimelineRow({ item }: { item: InvoiceActivityItem }) {
  const { Icon, iconBg, iconColor } = resolvePresentation(item);
  const displayTime = formatEventTime(item.isoDateTime);
  return (
    <li className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-nav-item",
          iconBg,
          iconColor,
        )}
      >
        <Icon className="size-4.5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-bold text-ink">{item.label}</div>
        <time dateTime={item.isoDateTime} className="text-label text-ink-3">
          {displayTime}
        </time>
      </div>
    </li>
  );
}

interface InvoiceActivityCardProps {
  activity: ReadonlyArray<InvoiceActivityItem>;
}

export function InvoiceActivityCard({ activity }: InvoiceActivityCardProps) {
  return (
    <Card title="Activity" headingLevel={3}>
      {activity.length === 0 ? (
        <p className="px-6 py-5 text-body-sm text-ink-3">No activity yet</p>
      ) : (
        <ol aria-label="Invoice activity" className="px-6 py-1">
          {activity.map((item) => (
            <TimelineRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </Card>
  );
}
