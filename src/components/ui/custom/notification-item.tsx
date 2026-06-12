import Link from "next/link";

import { cn, formatAmount, relTime } from "@/lib/utils";
import { NotificationRail } from "@/components/ui/custom/notification-rail";
import { NotificationIcon } from "@/components/ui/custom/notification-icon";
import { NotificationDot } from "@/components/ui/custom/notification-dot";
import type { NotificationTone } from "@/lib/types/notifications";

export interface NotificationItemProps {
  customer: string;
  verb: string;
  amount?: number;
  invoiceNo?: string;
  tone: NotificationTone;
  timestamp: string | Date;
  unread?: boolean;
  href?: string;
}

const ITEM_CLASSES = cn(
  "relative flex w-full items-stretch gap-3 text-left transition-colors",
  "pl-5 pr-4 pt-3 pb-3.5",
  "lg:pl-6 lg:pr-5 lg:pt-2.5 lg:pb-3",
  "hover:bg-surface-2",
  "focus-visible:outline-none focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-inset",
);

interface ItemBodyProps {
  customer: string;
  verb: string;
  amount?: number;
  invoiceNo?: string;
  tone: NotificationTone;
  timestamp: string | Date;
  unread: boolean;
}

function ItemBody({ customer, verb, amount, invoiceNo, tone, timestamp, unread }: ItemBodyProps) {
  const timeLabel = relTime(timestamp);
  return (
    <>
      <NotificationRail tone={tone} />
      <NotificationIcon tone={tone} className="self-start" />
      <div className="min-w-0 flex-1 self-center">
        <p className="text-caption text-ink-2 leading-snug">
          <span className="font-bold text-ink">{customer}</span> {verb}
          {amount !== undefined && (
            <>
              {" "}
              <span className="font-bold text-ink tabular-nums">₹{formatAmount(amount)}</span>
            </>
          )}
        </p>
        {invoiceNo && <p className="text-label text-ink-3 mt-1">{invoiceNo}</p>}
        <p className="text-label text-ink-3 mt-0.5">{timeLabel}</p>
      </div>
      {unread && (
        <span className="self-start mt-2">
          <span className="sr-only">Unread</span>
          <NotificationDot withHalo />
        </span>
      )}
    </>
  );
}

function NotificationItem({
  customer,
  verb,
  amount,
  invoiceNo,
  tone,
  timestamp,
  unread = false,
  href,
}: NotificationItemProps) {
  const ariaLabel = [
    unread ? "Unread:" : null,
    `${customer} ${verb}`,
    amount !== undefined ? `₹${formatAmount(amount)}` : null,
    invoiceNo ?? null,
    relTime(timestamp),
  ]
    .filter(Boolean)
    .join(" ");

  const unreadClass = unread ? "bg-coral-soft/40" : "";

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel} className={cn(ITEM_CLASSES, unreadClass)}>
        <ItemBody
          customer={customer}
          verb={verb}
          amount={amount}
          invoiceNo={invoiceNo}
          tone={tone}
          timestamp={timestamp}
          unread={unread}
        />
      </Link>
    );
  }

  return (
    <button type="button" aria-label={ariaLabel} className={cn(ITEM_CLASSES, unreadClass)}>
      <ItemBody
        customer={customer}
        verb={verb}
        amount={amount}
        invoiceNo={invoiceNo}
        tone={tone}
        timestamp={timestamp}
        unread={unread}
      />
    </button>
  );
}

export { NotificationItem };
