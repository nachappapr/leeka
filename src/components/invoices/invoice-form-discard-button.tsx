"use client";

// Justified "use client": fires brandToast (client-only Sonner call).

import { Trash2 } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";

interface InvoiceFormDiscardButtonProps {
  onConfirm: () => void;
  /** Button label — "Discard" (create) or "Discard changes" (edit). */
  label?: string;
}

export function InvoiceFormDiscardButton({
  onConfirm,
  label = "Discard",
}: InvoiceFormDiscardButtonProps) {
  function handleClick() {
    brandToast.warn({
      title: "Discard this invoice?",
      sub: "It won't be saved. You can't undo this.",
      // duration: Infinity keeps the confirm visible until the user acts or
      // explicitly dismisses it — they shouldn't have to race the auto-dismiss.
      duration: Infinity,
      actions: [
        {
          label: "Discard",
          primary: true,
          icon: <Trash2 className="size-3.5" aria-hidden />,
          onClick: onConfirm,
        },
        {
          label: "Keep editing",
          // No onClick — toast auto-dismisses on any action button press.
        },
      ],
    });
  }

  return (
    <PillButton tone="ghost" type="button" onClick={handleClick}>
      <Trash2 aria-hidden />
      {label}
    </PillButton>
  );
}
