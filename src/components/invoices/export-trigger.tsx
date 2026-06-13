"use client";

import { useRef } from "react";

import { Download, Lock } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";

export function ExportTrigger() {
  const { exportOpen, openExport, isProUser } = useInvoiceListActions();
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!isProUser) {
    return (
      <PillButton
        ref={triggerRef}
        tone="outline"
        size="md"
        disabled
        focusableWhenDisabled
        aria-disabled="true"
        aria-label="Export — Pro feature. Upgrade to Pro to export GST reports."
      >
        <Lock aria-hidden />
        Export
        <span className="ml-0.5 inline-flex items-center rounded-full bg-coral-soft px-1.5 py-0.5 text-kicker font-black tracking-wider text-coral-ink uppercase">
          Pro
        </span>
      </PillButton>
    );
  }

  return (
    <PillButton
      ref={triggerRef}
      tone="outline"
      size="md"
      onClick={() => openExport("csv", triggerRef)}
      aria-haspopup="dialog"
      aria-expanded={exportOpen}
      aria-label="Export"
    >
      <Download aria-hidden />
      Export
    </PillButton>
  );
}
