// No "use client": this is a presentational bar with no hooks/handlers of its
// own. It is composed inside the (client) invoice forms, so it rides their
// client boundary without needing its own directive. InvoiceFormDiscardButton,
// InvoiceFormDeleteButton, and InvoiceFormSaveDraftButton each carry their own
// "use client" boundaries.

import { WhatsApp } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import type { Invoice } from "@/lib/types";

import { InvoiceFormDiscardButton } from "./invoice-form-discard-button";
import { InvoiceFormDeleteButton } from "./invoice-form-delete-button";
import { InvoiceFormSaveDraftButton } from "./invoice-form-save-draft-button";

interface InvoiceFormDesktopActionBarProps {
  canSend: boolean;
  invoice: Invoice;
  onDiscard: () => void;
  /** Ghost-button label — "Discard" (create) vs "Discard changes" (edit). */
  discardLabel?: string;
  /** "edit" mode replaces the Discard button with a Delete Invoice button. */
  mode?: "create" | "edit";
  /** Called when delete is clicked (edit mode only); caller fires the toast. */
  onDelete?: () => void;
}

export function InvoiceFormDesktopActionBar({
  canSend,
  invoice,
  onDiscard,
  discardLabel = "Discard",
  mode = "create",
  onDelete,
}: InvoiceFormDesktopActionBarProps) {
  return (
    <div className="flex items-center gap-2.5 mt-1 max-mobile:hidden">
      {mode === "edit" && onDelete ? (
        <InvoiceFormDeleteButton onDelete={onDelete} />
      ) : (
        <InvoiceFormDiscardButton onConfirm={onDiscard} label={discardLabel} />
      )}
      <div className="flex-1" />
      <InvoiceFormSaveDraftButton invoice={invoice} />
      <PillButton tone="whatsapp" type="submit" disabled={!canSend} aria-disabled={!canSend}>
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
    </div>
  );
}
