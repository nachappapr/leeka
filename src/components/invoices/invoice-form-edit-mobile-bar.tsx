"use client";

// Justified "use client": owns moreOpen state + moreRef for focus-restore.

import type React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ChevronLeft, ChevronRight, Edit, MoreHorizontal, Trash2 } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import type { Invoice, SaveDraftOutcome } from "@/lib/types";

import { fireDraftSavedToast } from "./invoice-form-save-draft-button";
import type { InvoiceFormSheetItem } from "./invoice-form-mobile-sheet";
import { InvoiceFormMobileSheet } from "./invoice-form-mobile-sheet";

interface InvoiceFormEditMobileBarProps {
  canPreview: boolean;
  isPending: boolean;
  previewDisabledMsg?: string;
  onPreview: () => void;
  onDiscard: () => void;
  onSaveDraft: () => Promise<SaveDraftOutcome>;
  /** Fires the delete confirm toast (edit mode only — omit in create mode). */
  onDelete?: () => void;
  invoice: Invoice;
  /**
   * Ref to the "Preview invoice" CTA so the parent can restore focus to it
   * when the user returns from the review view (WCAG 2.4.3 focus management).
   */
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

// Sticky mobile action bar shown while the user is editing an invoice (before
// they tap "Preview invoice" to enter the review view).
export function InvoiceFormEditMobileBar({
  canPreview,
  isPending,
  previewDisabledMsg,
  onPreview,
  onDiscard,
  onSaveDraft,
  onDelete,
  invoice,
  buttonRef,
}: InvoiceFormEditMobileBarProps) {
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);

  const sheetItems: InvoiceFormSheetItem[] = [
    {
      label: "Save as draft",
      icon: <Edit className="size-4.5" aria-hidden />,
      onClick: async () => {
        setMoreOpen(false);
        setIsSavingDraft(true);
        try {
          const outcome = await onSaveDraft();
          if (outcome.ok) {
            fireDraftSavedToast(invoice, () => router.push("/invoices"));
          } else {
            brandToast.error({ title: outcome.error });
          }
        } finally {
          setIsSavingDraft(false);
        }
      },
    },
    {
      label: "Discard & go back",
      icon: <ChevronLeft className="size-4.5" aria-hidden />,
      onClick: () => {
        setMoreOpen(false);
        onDiscard();
      },
    },
    ...(onDelete
      ? [
          {
            label: "Delete invoice",
            icon: <Trash2 className="size-4.5" aria-hidden />,
            danger: true,
            onClick: () => {
              setMoreOpen(false);
              onDelete();
            },
          } satisfies InvoiceFormSheetItem,
        ]
      : []),
  ];

  return (
    <>
      {/* <footer> landmark is sufficient for orientation. role="toolbar" is
          dropped: it implies roving-tabindex arrow-key navigation we do not
          implement (APG Toolbar pattern). Tab access to the buttons is
          unchanged. */}
      <footer
        aria-label="Create invoice actions"
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-sheet min-mobile:hidden"
      >
        <div className="flex items-center gap-2">
          {/* Primary CTA — aria-disabled (not `disabled`) so the reason can be
              announced to keyboard / screen-reader users via aria-describedby.
              buttonRef is attached so the parent can focus this element when
              returning from the review view (WCAG 2.4.3). */}
          <PillButton
            ref={buttonRef}
            type="button"
            tone="primary"
            size="md"
            className="flex-1 rounded-lg! aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            aria-disabled={!canPreview || isPending}
            aria-describedby={
              !canPreview && previewDisabledMsg ? "edit-bar-preview-hint" : undefined
            }
            onClick={() => {
              if (canPreview && !isPending) onPreview();
            }}
          >
            Preview invoice
            <ChevronRight strokeWidth={2.4} aria-hidden />
          </PillButton>

          {!canPreview && previewDisabledMsg ? (
            <span id="edit-bar-preview-hint" className="sr-only">
              {previewDisabledMsg}
            </span>
          ) : null}

          {/* ⋯ more-actions trigger — plain button (not SheetTrigger) so that the
              controlled InvoiceFormMobileSheet can handle focus-restore via triggerRef. */}
          <button
            ref={moreRef}
            type="button"
            aria-label="More actions"
            aria-busy={isSavingDraft}
            onClick={() => {
              if (!isSavingDraft) setMoreOpen(true);
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink-3 bg-card text-ink-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2"
          >
            <MoreHorizontal className="size-5" aria-hidden />
          </button>
        </div>
      </footer>

      <InvoiceFormMobileSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Invoice · Actions"
        items={sheetItems}
        triggerRef={moreRef}
      />
    </>
  );
}
