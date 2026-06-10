"use client";

import { Check } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";

export function MarkAllReadButton() {
  return (
    <PillButton
      tone="outline"
      size="sm"
      onClick={() => {
        // Wired to real notification state in a future unit
      }}
    >
      <Check className="size-4" aria-hidden />
      Mark all read
    </PillButton>
  );
}
