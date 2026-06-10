"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { CustomerFormModal } from "@/components/ui/custom/customer-form-modal";
import type { Customer, CustomerSavePayload } from "@/lib/types";

interface CustomerEditTriggerProps {
  customer: Customer;
  /** Optional callback — caller can update local/server state on save. */
  onSave?: (payload: CustomerSavePayload) => void;
  /** Optional callback — caller handles deletion (e.g. list-row removal). */
  onDelete?: (customer: Customer) => void;
  /** Extra classes for the trigger button (e.g. mobile flex sizing). */
  className?: string;
}

export function CustomerEditTrigger({
  customer,
  onSave,
  onDelete,
  className,
}: CustomerEditTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function handleSave(payload: CustomerSavePayload) {
    // TODO: wire to backend — update customer via Server Action
    onSave?.(payload);
  }

  function handleDelete(c: Customer) {
    // TODO: wire to backend — delete customer via Server Action
    onDelete?.(c);
    router.push("/customers");
  }

  return (
    <>
      <PillButton
        ref={triggerRef}
        tone="primary"
        size="md"
        onClick={() => setOpen(true)}
        aria-label={`Edit details for ${customer.name}`}
        className={className}
      >
        <Edit aria-hidden />
        <span>Edit details</span>
      </PillButton>

      <CustomerFormModal
        mode="edit"
        initial={customer}
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        finalFocusRef={triggerRef}
      />
    </>
  );
}
