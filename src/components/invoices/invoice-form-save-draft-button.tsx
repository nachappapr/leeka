"use client";

// Justified "use client": owns saving/saved state machine, useRouter for
// "Open drafts" navigation, and fires brandToast (client-only).

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Check, Edit, FileText, Loader2 } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import type { Invoice, SaveDraftOutcome } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Shared toast helper ───────────────────────────────────────────────────────
// Exported so mobile-sheet rows can fire the same toast without the inline
// state machine (they manage their own close + don't need saving/saved states).
export function fireDraftSavedToast(invoice: Invoice, onOpenDrafts: () => void) {
  brandToast.success({
    title: "Saved as draft",
    sub: `${invoice.id} · ${invoice.customer} · ${invoice.amount}`,
    actions: [
      {
        label: "Open drafts",
        icon: <FileText className="size-3.5" aria-hidden />,
        onClick: onOpenDrafts,
      },
    ],
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
interface InvoiceFormSaveDraftButtonProps {
  invoice: Invoice;
  onSaveDraft: () => Promise<SaveDraftOutcome>;
  fullWidth?: boolean;
  className?: string;
}

type SaveState = null | "saving" | "saved";

export function InvoiceFormSaveDraftButton({
  invoice,
  onSaveDraft,
  fullWidth,
  className,
}: InvoiceFormSaveDraftButtonProps) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<SaveState>(null);

  async function handleSave() {
    if (saveState !== null) return;

    setSaveState("saving");
    const outcome = await onSaveDraft();

    if (outcome.ok) {
      setSaveState("saved");
      fireDraftSavedToast(invoice, () => router.push("/invoices"));
      setTimeout(() => setSaveState(null), 2400);
    } else {
      setSaveState(null);
      brandToast.error({ title: outcome.error });
    }
  }

  const isSaving = saveState === "saving";
  const isSaved = saveState === "saved";

  return (
    <>
      <PillButton
        tone="draft"
        type="button"
        onClick={handleSave}
        aria-busy={isSaving}
        aria-disabled={isSaving}
        className={cn(fullWidth && "w-full", className)}
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />
            Saving…
          </>
        ) : isSaved ? (
          <>
            <Check strokeWidth={2.8} aria-hidden />
            Draft saved
          </>
        ) : (
          <>
            <Edit aria-hidden />
            Save as draft
          </>
        )}
      </PillButton>

      {/* Live region so screen readers announce state transitions
          without relying solely on the visual label change. The success
          toast (sonner) has its own live region for the confirmation. */}
      <span role="status" className="sr-only">
        {isSaving ? "Saving draft…" : isSaved ? "Draft saved" : ""}
      </span>
    </>
  );
}
