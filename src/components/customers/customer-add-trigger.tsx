"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { CustomerFormModal } from "@/components/ui/custom/customer-form-modal";
import { upsertCustomerAction } from "@/app/(app)/customers/actions";
import type { CustomerSavePayload } from "@/lib/types";

interface CustomerAddTriggerProps {
  onSave?: (payload: CustomerSavePayload) => void;
}

export function CustomerAddTrigger({ onSave }: CustomerAddTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  async function handleSave(payload: CustomerSavePayload) {
    const result = await upsertCustomerAction(payload);
    if (result.ok) {
      router.refresh();
      onSave?.(payload);
    }
  }

  return (
    <>
      <PillButton
        ref={triggerRef}
        tone="primary"
        size="md"
        onClick={() => setOpen(true)}
        aria-label="Add customer"
      >
        <Plus aria-hidden />
        <span className="max-mobile:hidden">Add customer</span>
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
