import type { InvoiceStatus } from "@/lib/types/lifecycle";

export interface ActionDescriptor {
  id: "markPaid" | "whatsapp" | "copyLink" | "edit" | "duplicate" | "pdf" | "deleteOrCancel";
  label: string;
  enabled: boolean;
  hint?: string;
  variant: "default" | "primary" | "destructive";
  intent: "markPaid" | "send" | "copyLink" | "edit" | "duplicate" | "pdf" | "delete" | "cancel";
}

export function invoiceRowActions(input: { status: InvoiceStatus }): ActionDescriptor[] {
  const { status } = input;
  return [
    buildMarkPaid(status),
    buildWhatsApp(status),
    buildCopyLink(status),
    buildEdit(status),
    buildDuplicate(),
    buildPdf(),
    buildDeleteOrCancel(status),
  ];
}

function buildMarkPaid(status: InvoiceStatus): ActionDescriptor {
  const base = { id: "markPaid" as const, label: "Mark paid", intent: "markPaid" as const };
  switch (status) {
    case "draft":
      return {
        ...base,
        enabled: false,
        variant: "default",
        hint: "Issue the invoice before recording payment",
      };
    case "paid":
      return { ...base, enabled: false, variant: "default", hint: "This invoice is already paid" };
    case "cancelled":
      return {
        ...base,
        enabled: false,
        variant: "default",
        hint: "A cancelled invoice can't be paid",
      };
    default:
      return { ...base, enabled: true, variant: "primary" };
  }
}

function buildWhatsApp(status: InvoiceStatus): ActionDescriptor {
  const base = { id: "whatsapp" as const, intent: "send" as const, variant: "default" as const };
  switch (status) {
    case "sent":
    case "viewed":
      return { ...base, label: "Send on WhatsApp", enabled: true };
    case "partial":
    case "pending":
    case "overdue":
      return { ...base, label: "Remind on WhatsApp", enabled: true };
    case "draft":
      return {
        ...base,
        label: "Send on WhatsApp",
        enabled: false,
        hint: "Issue the invoice first",
      };
    case "paid":
      return {
        ...base,
        label: "Send on WhatsApp",
        enabled: false,
        hint: "Already paid — nothing left to collect",
      };
    case "cancelled":
      return {
        ...base,
        label: "Send on WhatsApp",
        enabled: false,
        hint: "This invoice is cancelled — its link is dead",
      };
  }
}

function buildCopyLink(status: InvoiceStatus): ActionDescriptor {
  const base = {
    id: "copyLink" as const,
    label: "Copy pay link",
    intent: "copyLink" as const,
    variant: "default" as const,
  };
  switch (status) {
    case "sent":
    case "viewed":
    case "partial":
    case "overdue":
    case "pending":
      return { ...base, enabled: true };
    case "draft":
      return { ...base, enabled: false, hint: "No payment link yet — issue the invoice first" };
    case "paid":
      return { ...base, enabled: false, hint: "This invoice is paid — its link is closed" };
    case "cancelled":
      return { ...base, enabled: false, hint: "This invoice is cancelled — its link is dead" };
  }
}

function buildEdit(status: InvoiceStatus): ActionDescriptor {
  const base = {
    id: "edit" as const,
    label: "Edit invoice",
    intent: "edit" as const,
    variant: "default" as const,
  };
  if (status === "draft") {
    return { ...base, enabled: true };
  }
  return {
    ...base,
    enabled: false,
    hint: "Issued invoices can't be edited — duplicate to make a corrected copy",
  };
}

function buildDuplicate(): ActionDescriptor {
  return {
    id: "duplicate",
    label: "Duplicate",
    enabled: true,
    variant: "default",
    intent: "duplicate",
  };
}

function buildPdf(): ActionDescriptor {
  return {
    id: "pdf",
    label: "Download PDF",
    enabled: false,
    hint: "Coming soon",
    variant: "default",
    intent: "pdf",
  };
}

function buildDeleteOrCancel(status: InvoiceStatus): ActionDescriptor {
  const base = { id: "deleteOrCancel" as const, variant: "destructive" as const };
  switch (status) {
    case "draft":
      return { ...base, label: "Delete", intent: "delete", enabled: true };
    case "sent":
    case "viewed":
    case "partial":
    case "overdue":
    case "pending":
      return { ...base, label: "Cancel invoice", intent: "cancel", enabled: true };
    case "paid":
      return {
        ...base,
        label: "Delete",
        intent: "delete",
        enabled: false,
        hint: "A paid invoice can't be deleted",
      };
    case "cancelled":
      return {
        ...base,
        label: "Delete",
        intent: "delete",
        enabled: false,
        hint: "Cancelled invoices are kept for your audit trail",
      };
  }
}
