"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Edit,
  MoreVertical,
  Share,
  Trash2,
  WhatsApp,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives/dropdown-menu";
import type { Invoice } from "@/lib/types";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";

interface InvoiceRowActionsMenuProps {
  invoice: Invoice;
}

export function InvoiceRowActionsMenu({ invoice }: InvoiceRowActionsMenuProps) {
  const { id, status } = invoice;
  const [sendOpen, setSendOpen] = useState(false);

  // Tracks a deferred intent to open the send modal.
  // Set to true inside the menu item onClick; consumed in onOpenChangeComplete
  // once the menu's close animation has fully finished. This prevents the
  // Menu→Dialog focus-trap/scroll-lock race that leaves the page non-interactive.
  const pendingSendRef = useRef(false);

  // Unique id prefix per row for aria-describedby wiring
  const hintId = `row-actions-hint-${id.replace(/[^a-z0-9]/gi, "")}`;

  const whatsappDisabled = status === "paid";
  const payLinkDisabled = status === "draft" || status === "paid";

  const whatsappHint =
    whatsappDisabled ? "Already paid — nothing left to collect" : undefined;

  const payLinkHint = payLinkDisabled
    ? status === "draft"
      ? "No pay link yet — send the invoice first"
      : "Invoice is paid — link is closed"
    : undefined;

  // Called by Base UI MenuRoot after its close animation fully completes.
  // If a send was requested via pendingSendRef, open the modal now that the
  // menu has fully unmounted/hidden — no lifecycle overlap, no stuck inert.
  function handleMenuOpenChangeComplete(open: boolean) {
    if (!open && pendingSendRef.current) {
      pendingSendRef.current = false;
      setSendOpen(true);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/invoices/${invoice.id.replace("#", "")}`}
          aria-label={`View invoice ${invoice.id} for ${invoice.customer}`}
          className="after:absolute after:inset-0 sr-only focus-visible:not-sr-only focus-visible:rounded-md focus-visible:bg-card focus-visible:px-2 focus-visible:py-1 focus-visible:text-body-sm focus-visible:font-medium focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          View
        </Link>
        <DropdownMenu onOpenChangeComplete={handleMenuOpenChangeComplete}>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label="Invoice actions"
          className="relative z-10 inline-flex size-8 items-center justify-center rounded-lg bg-transparent text-ink-3 outline-none transition-colors hover:bg-background hover:text-ink data-popup-open:bg-background data-popup-open:text-ink focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
        >
          <MoreVertical className="size-4" aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="w-55 rounded-md bg-card p-1.5 ring-1 ring-border shadow-md"
        >
          {/* 1. Send on WhatsApp */}
          <DropdownMenuItem
            disabled={whatsappDisabled}
            title={whatsappDisabled ? whatsappHint : undefined}
            aria-describedby={whatsappDisabled ? `${hintId}-whatsapp` : undefined}
            onClick={() => {
              if (!whatsappDisabled) {
                // Signal intent — the modal opens in onOpenChangeComplete,
                // after the menu's close animation has fully finished.
                pendingSendRef.current = true;
              }
            }}
            className="gap-2 rounded-sm px-2 py-1.5 bg-paid-soft text-paid-ink hover:bg-paid-soft focus:bg-paid-soft focus:text-paid-ink data-disabled:cursor-not-allowed"
          >
            <WhatsApp className="size-3.5 text-whatsapp-icon" aria-hidden />
            <span className="text-body-sm font-bold">Send on WhatsApp</span>
            {whatsappDisabled && (
              <span id={`${hintId}-whatsapp`} className="sr-only">
                {whatsappHint}
              </span>
            )}
          </DropdownMenuItem>

          {/* 2. Copy pay link */}
          <DropdownMenuItem
            disabled={payLinkDisabled}
            title={payLinkDisabled ? payLinkHint : undefined}
            aria-describedby={payLinkDisabled ? `${hintId}-paylink` : undefined}
            className="gap-2 rounded-sm px-2 py-1.5 focus:bg-background data-disabled:cursor-not-allowed"
          >
            <Share className="size-3.5 text-ink-3" aria-hidden />
            <span className="text-body-sm font-bold">Copy pay link</span>
            {payLinkDisabled && (
              <span id={`${hintId}-paylink`} className="sr-only">
                {payLinkHint}
              </span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 3. Edit invoice — real anchor via render prop */}
          <DropdownMenuItem
            render={<Link href={`/invoices/${invoice.id.replace("#", "")}/edit`} />}
            className="gap-2 rounded-sm px-2 py-1.5 focus:bg-background"
          >
            <Edit className="size-3.5 text-ink-3" aria-hidden />
            <span className="text-body-sm font-bold">Edit invoice</span>
          </DropdownMenuItem>

          {/* 4. Duplicate */}
          <DropdownMenuItem className="gap-2 rounded-sm px-2 py-1.5 focus:bg-background">
            <Copy className="size-3.5 text-ink-3" aria-hidden />
            <span className="text-body-sm font-bold">Duplicate</span>
          </DropdownMenuItem>

          {/* 5. Download PDF */}
          <DropdownMenuItem className="gap-2 rounded-sm px-2 py-1.5 focus:bg-background">
            <Download className="size-3.5 text-ink-3" aria-hidden />
            <span className="text-body-sm font-bold">Download PDF</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 6. Delete */}
          <DropdownMenuItem
            variant="destructive"
            className="gap-2 rounded-sm px-2 py-1.5 text-overdue-ink hover:bg-overdue-soft focus:bg-overdue-soft focus:text-overdue-ink"
          >
            <Trash2 className="size-3.5 text-overdue" aria-hidden />
            <span className="text-body-sm font-bold">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send on WhatsApp modal — portaled, DOM position irrelevant */}
      <SendChannelsModal
        invoice={invoice}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />
    </>
  );
}
