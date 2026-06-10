import Link from "next/link";

import { Check, Download, Edit, WhatsApp } from "@/components/icons";
import { PillButton, pillButtonVariants } from "@/components/ui/custom/pill-button";
import { cn } from "@/lib/utils";

interface InvoiceActionsOpenProps {
  invoiceId: string;
  isOverdue: boolean;
  onSend: () => void;
}

export function InvoiceActionsOpen({ invoiceId, isOverdue, onSend }: InvoiceActionsOpenProps) {
  return (
    <>
      <PillButton tone="primary" size="md" className="w-full">
        <Check strokeWidth={2.4} aria-hidden />
        Mark as paid
      </PillButton>
      <PillButton type="button" tone="whatsapp" size="md" className="w-full" onClick={onSend}>
        <WhatsApp aria-hidden />
        {isOverdue ? "Send nudge" : "Send reminder"}
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/invoices/${invoiceId.replace("#", "")}/edit`}
          className={cn(pillButtonVariants({ tone: "outline", size: "md" }))}
        >
          <Edit aria-hidden />
          Edit
        </Link>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
    </>
  );
}
