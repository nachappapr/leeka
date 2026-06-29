"use client";

import type React from "react";

import { Clock, Copy, Download, Edit, MoreHorizontal, Share, Trash2 } from "@/components/icons";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/primitives/sheet";
import { SheetActionItem } from "@/components/ui/custom/sheet-action-item";
import { invoiceEditHref } from "@/lib/invoice/invoice-detail-href";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

interface InvoiceDetailMobileSheetProps {
  invoiceId: string;
  invoiceUuid?: string;
  status: StatusPillStatus;
  reversible?: boolean;
  onMarkUnpaid?: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

interface SheetAction {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

function getActions(
  invoiceId: string,
  invoiceUuid: string | undefined,
  status: StatusPillStatus,
  reversible: boolean,
  onMarkUnpaid: (() => void) | undefined,
): SheetAction[] {
  const base: SheetAction[] = [
    {
      icon: <Edit className="size-4.5" aria-hidden />,
      label: "Edit invoice",
      href: invoiceEditHref({ id: invoiceId, invoiceUuid }),
    },
    { icon: <Download className="size-4.5" aria-hidden />, label: "Download PDF" },
    { icon: <Share className="size-4.5" aria-hidden />, label: "Share link" },
    { icon: <Copy className="size-4.5" aria-hidden />, label: "Duplicate" },
  ];
  if (status === "paid") {
    if (reversible) {
      base.push({
        icon: <Clock className="size-4.5" aria-hidden />,
        label: "Mark unpaid",
        onClick: onMarkUnpaid,
      });
    } else {
      base.push({
        icon: <Clock className="size-4.5" aria-hidden />,
        label: "Mark unpaid",
        disabled: true,
        disabledHint: "Gateway-confirmed payments can't be undone here",
      });
    }
  }
  return base;
}

export function InvoiceDetailMobileSheet({
  invoiceId,
  invoiceUuid,
  status,
  reversible = true,
  onMarkUnpaid,
  triggerRef,
}: InvoiceDetailMobileSheetProps) {
  const actions = getActions(invoiceId, invoiceUuid, status, reversible, onMarkUnpaid);

  return (
    <Sheet>
      <SheetTrigger
        ref={triggerRef}
        aria-label="More actions"
        className="flex size-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink-3 bg-card text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
      >
        <MoreHorizontal className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl border-0 gap-0 bg-card p-0 pt-2"
        aria-labelledby="mobile-sheet-title"
      >
        <div className="mx-auto mt-1.5 mb-3 h-1 w-10 rounded-full bg-line-strong" aria-hidden />

        <p
          id="mobile-sheet-title"
          className="px-5.5 pb-2.5 text-kicker uppercase tracking-wider text-ink-3"
        >
          {invoiceId} · Actions
        </p>

        <ul>
          {actions.map((action) => (
            <li key={action.label}>
              <SheetActionItem
                icon={action.icon}
                label={action.label}
                href={action.href}
                onClick={action.onClick}
                disabled={action.disabled}
                disabledHint={action.disabledHint}
              />
            </li>
          ))}
        </ul>

        <hr className="mx-5.5 my-2 border-border" />

        <SheetClose className="flex w-full items-center gap-3.5 px-5.5 py-3.5 text-left text-body font-semibold text-overdue transition-colors active:bg-background hover:bg-overdue-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-overdue">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-nav-item bg-overdue-soft text-overdue">
            <Trash2 className="size-4.5" aria-hidden />
          </span>
          Delete invoice
        </SheetClose>

        <div className="px-3.5 pt-2.5 pb-4">
          <SheetClose className="h-12 w-full rounded-lg bg-background text-body font-bold text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2">
            Cancel
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
