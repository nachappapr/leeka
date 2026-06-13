"use client";

import { useTransition } from "react";
import Link from "next/link";

import { Check, Download, Edit, Loader2, WhatsApp } from "@/components/icons";
import { PillButton, pillButtonVariants } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { issueInvoice } from "@/app/(app)/invoices/actions";
import { cn } from "@/lib/utils";

interface InvoiceActionsDraftProps {
  invoiceId: string;
  invoiceUuid: string;
  onSend: () => void;
}

export function InvoiceActionsDraft({ invoiceId, invoiceUuid, onSend }: InvoiceActionsDraftProps) {
  const [isPending, startTransition] = useTransition();

  function handleIssue() {
    startTransition(async () => {
      const result = await issueInvoice(invoiceUuid);
      if (!result.ok) {
        brandToast.error({ title: "Couldn't issue invoice", sub: result.error });
        return;
      }
      brandToast.success({
        title: "Invoice issued",
        sub: `Invoice ${result.data.number} is now live.`,
      });
    });
  }

  return (
    <>
      <PillButton
        type="button"
        tone="primary"
        size="md"
        className="w-full"
        disabled={isPending}
        aria-busy={isPending}
        onClick={handleIssue}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
            Issuing&hellip;
          </>
        ) : (
          <>
            <Check strokeWidth={2.4} aria-hidden />
            Issue invoice
          </>
        )}
      </PillButton>
      <PillButton type="button" tone="whatsapp" size="md" className="w-full" onClick={onSend}>
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/invoices/${invoiceId.replace("#", "")}/edit`}
          aria-label="Edit invoice"
          className={cn(pillButtonVariants({ tone: "outline", size: "md" }), "w-full")}
        >
          <Edit aria-hidden />
          Edit
        </Link>
        <PillButton tone="outline" size="md">
          <Download aria-hidden />
          PDF
        </PillButton>
      </div>
      <p role="status" aria-atomic="true" className="sr-only">
        {isPending ? "Issuing invoice…" : " "}
      </p>
    </>
  );
}
