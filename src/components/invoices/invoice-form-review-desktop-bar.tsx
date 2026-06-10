"use client";

// Justified "use client": owns sendOpen state for SendChannelsModal.

import { useState } from "react";

import { ChevronLeft, WhatsApp } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { SendChannelsModal } from "@/components/ui/custom/send-channels-modal";
import type { Invoice } from "@/lib/types";

import { InvoiceFormSaveDraftButton } from "./invoice-form-save-draft-button";

interface InvoiceFormReviewDesktopBarProps {
  invoice: Invoice;
  onBack: () => void;
}

// Desktop-only action row that sits beneath the live preview in the review
// (preview) view. Mirrors the .create-preview-actions design pattern.
// Hidden on mobile — the mobile sticky bar (InvoiceFormPreviewMobileBar)
// provides equivalent actions on small screens.
export function InvoiceFormReviewDesktopBar({ invoice, onBack }: InvoiceFormReviewDesktopBarProps) {
  const [sendOpen, setSendOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2.5 max-mobile:hidden">
        <PillButton tone="ghost" type="button" onClick={onBack}>
          <ChevronLeft aria-hidden />
          Back to edit
        </PillButton>

        <div className="flex-1" />

        <InvoiceFormSaveDraftButton invoice={invoice} />

        <PillButton tone="whatsapp" type="button" onClick={() => setSendOpen(true)}>
          <WhatsApp aria-hidden />
          Send on WhatsApp
        </PillButton>
      </div>

      <SendChannelsModal invoice={invoice} open={sendOpen} onOpenChange={setSendOpen} />
    </>
  );
}
