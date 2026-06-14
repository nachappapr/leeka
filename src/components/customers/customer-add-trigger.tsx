"use client";

import { useRef, useState } from "react";
import { Plus } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { CustomerFormModal } from "@/components/ui/custom/customer-form-modal";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { upsertCustomerAction } from "@/app/(app)/customers/actions";
import type { CustomerSavePayload } from "@/lib/types";

interface CustomerAddTriggerProps {
  onSave?: (payload: CustomerSavePayload) => void;
  layout?: "inline" | "block";
}

export function CustomerAddTrigger({ onSave, layout = "inline" }: CustomerAddTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isBlock = layout === "block";

  async function handleSave(payload: CustomerSavePayload) {
    const result = await upsertCustomerAction(payload);
    if (result.ok) {
      brandToast.success({ title: "Customer added" });
      onSave?.(payload);
    }
    return result;
  }

  return (
    <>
      <PillButton
        ref={triggerRef}
        tone="primary"
        size="md"
        className={isBlock ? "max-mobile:flex-1" : undefined}
        onClick={() => setOpen(true)}
        aria-label={isBlock ? undefined : "Add customer"}
      >
        <Plus aria-hidden />
        <span className={isBlock ? undefined : "max-mobile:hidden"}>Add customer</span>
      </PillButton>

      <CustomerFormModal
        mode="add"
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        finalFocusRef={triggerRef}
      />
    </>
  );
}
