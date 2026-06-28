"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
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
import { brandToast } from "@/components/ui/custom/brand-toast";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import { invoiceRowActions, type ActionDescriptor } from "@/lib/invoice/invoice-row-actions";
import { clientEnv } from "@/lib/env.client";
import { cn } from "@/lib/utils";

interface InvoiceRowActionsMenuProps {
  invoice: Invoice;
}

function descriptorIcon(id: ActionDescriptor["id"]) {
  switch (id) {
    case "markPaid":
      return CheckCircle2;
    case "whatsapp":
      return WhatsApp;
    case "copyLink":
      return Share;
    case "edit":
      return Edit;
    case "duplicate":
      return Copy;
    case "pdf":
      return Download;
    case "deleteOrCancel":
      return Trash2;
  }
}

function descriptorIconClass(d: ActionDescriptor): string {
  if (d.id === "whatsapp") return "size-3.5 text-whatsapp-icon";
  if (d.variant === "destructive") return "size-3.5 text-overdue";
  if (d.variant === "primary") return "size-3.5 text-paid-ink";
  return "size-3.5 text-ink-3";
}

function descriptorItemClass(d: ActionDescriptor): string {
  const base = "gap-2 rounded-sm px-2 py-1.5";
  if (d.variant === "primary") {
    return cn(
      base,
      "bg-paid-soft text-paid-ink hover:bg-paid-soft focus:bg-paid-soft focus:text-paid-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-paid-ink data-disabled:cursor-not-allowed",
    );
  }
  if (d.variant === "destructive") {
    return cn(
      base,
      "text-overdue-ink hover:bg-overdue-soft focus:bg-overdue-soft focus:text-overdue-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-overdue-ink",
    );
  }
  return cn(
    base,
    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-coral-press data-disabled:cursor-not-allowed",
  );
}

export function InvoiceRowActionsMenu({ invoice }: InvoiceRowActionsMenuProps) {
  const [sendOpen, setSendOpen] = useState(false);
  const pendingSendRef = useRef(false);
  const hintId = `row-actions-hint-${invoice.id.replace(/[^a-z0-9]/gi, "")}`;
  const descriptors = invoiceRowActions(invoice);

  function handleMenuOpenChangeComplete(open: boolean) {
    if (!open && pendingSendRef.current) {
      pendingSendRef.current = false;
      setSendOpen(true);
    }
  }

  // URL built synchronously — no server round-trip before clipboard write preserves transient activation
  async function handleCopyLink() {
    const token = invoice.publicToken;
    if (!token) {
      brandToast.error({ title: "Pay link unavailable" });
      return;
    }
    const appBase = clientEnv.NEXT_PUBLIC_APP_URL ?? clientEnv.NEXT_PUBLIC_SUPABASE_URL;
    const url = `${appBase}/pay/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      brandToast.success({ title: "Pay link copied" });
    } catch {
      brandToast.error({ title: "Couldn't copy pay link" });
    }
  }

  function dispatchAction(d: ActionDescriptor) {
    if (d.id === "whatsapp") {
      pendingSendRef.current = true;
    } else if (d.id === "copyLink") {
      void handleCopyLink();
    }
  }

  function renderDescriptor(d: ActionDescriptor) {
    const Icon = descriptorIcon(d.id);
    const disabled = !d.enabled;
    const itemHint = disabled ? d.hint : undefined;
    const itemHintId = `${hintId}-${d.id}`;

    return (
      <DropdownMenuItem
        key={d.id}
        disabled={disabled}
        title={itemHint}
        aria-describedby={itemHint ? itemHintId : undefined}
        variant={d.variant === "destructive" ? "destructive" : "default"}
        render={
          d.id === "edit" && d.enabled ? (
            <Link href={`/invoices/${invoice.id.replace("#", "")}/edit`} />
          ) : undefined
        }
        onClick={!disabled ? () => dispatchAction(d) : undefined}
        className={descriptorItemClass(d)}
      >
        <Icon className={descriptorIconClass(d)} aria-hidden />
        <span className="text-body-sm font-bold">{d.label}</span>
        {itemHint && (
          <span id={itemHintId} className="sr-only">
            {itemHint}
          </span>
        )}
      </DropdownMenuItem>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
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
            {descriptors.slice(0, 3).map(renderDescriptor)}
            <DropdownMenuSeparator />
            {descriptors.slice(3, 6).map(renderDescriptor)}
            <DropdownMenuSeparator />
            {descriptors.slice(6).map(renderDescriptor)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SendChannelsModal
        invoice={invoice}
        invoiceUuid={invoice.invoiceUuid ?? ""}
        open={sendOpen}
        onOpenChange={setSendOpen}
      />
    </>
  );
}
