"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { CustomerFormModal } from "@/components/ui/custom/customer-form-modal";
import { brandToast } from "@/components/ui/custom/brand-toast";
import { upsertCustomerAction, deleteCustomerAction } from "@/app/(app)/customers/actions";
import type { Customer, CustomerSavePayload } from "@/lib/types";

interface CustomerEditTriggerProps {
  customer: Customer;
  onSave?: (payload: CustomerSavePayload) => void;
  onDelete?: (customer: Customer) => void;
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

  async function handleSave(payload: CustomerSavePayload) {
    const result = await upsertCustomerAction({ ...payload, id: customer.id });
    if (result.ok) {
      brandToast.success({ title: "Changes saved" });
      onSave?.(payload);
    }
    return result;
  }

  async function handleDelete(c: Customer): Promise<boolean> {
    let result;
    try {
      result = await deleteCustomerAction(c.id);
    } catch {
      brandToast.error({ title: "Couldn't delete customer. Please try again." });
      return false;
    }
    if (result.ok) {
      brandToast.success({ title: "Customer deleted" });
      onDelete?.(c);
      router.push("/customers");
      return true;
    }
    brandToast.error({ title: result.error });
    return false;
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
