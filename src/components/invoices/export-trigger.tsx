"use client";

import { useRef } from "react";

import { Download } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { useInvoiceListActions } from "@/components/invoices/invoice-list-actions-provider";

export function ExportTrigger() {
  const { exportOpen, openExport } = useInvoiceListActions();
  const triggerRef = useRef<HTMLButtonElement>(null);

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
