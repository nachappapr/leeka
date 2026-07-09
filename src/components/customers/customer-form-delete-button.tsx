"use client";

import * as React from "react";
import { Trash2 } from "@/components/icons";
import { PillButton } from "@/components/ui/custom/pill-button";
import { brandToast } from "@/components/ui/custom/brand-toast";
import type { Customer } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerFormDeleteButtonProps {
  onDelete: () => void;
}

// Result toasts (success/error) must reuse this id: the confirm toast is
// duration:Infinity, and firing the result under a different id resurrects
// the dismissed confirm (cf. the invoices delete flow).
export function deleteCustomerToastId(customerId: string) {
  return `delete-customer-${customerId}`;
}

export function fireDeleteCustomerToast(customer: Customer, onConfirm: () => void) {
  const toastId = deleteCustomerToastId(customer.id);
  brandToast.warn({
    id: toastId,
    title: "Delete this customer?",
    sub: `${customer.name} · Past invoices stay in your records.`,
    duration: Infinity,
    actions: [
      {
        label: "Delete",
        primary: true,
        icon: <Trash2 className="size-3.5" aria-hidden />,
        onClick: onConfirm,
      },
      {
        label: "Cancel",
      },
    ],
  });
  return toastId;
}

export const CustomerFormDeleteButton = React.forwardRef<
  HTMLButtonElement,
  CustomerFormDeleteButtonProps
>(function CustomerFormDeleteButton({ onDelete }, ref) {
  return (
    <PillButton
      ref={ref}
      type="button"
      tone="outline"
      size="md"
      onClick={onDelete}
      aria-label="Delete customer"
      className={cn(
        // Match design `.modal-delete`: rounded-lg like the sibling Cancel/Save
        // buttons (PillButton's base is rounded-full), faint coral-tinted border,
        // white surface, overdue text.
        "rounded-lg border-overdue/30 bg-card text-overdue",
        "hover:border-overdue/55 hover:bg-overdue-soft/40",
        "focus-visible:ring-overdue",
        "min-mobile:px-3.5",
        "max-mobile:h-12 max-mobile:w-12 max-mobile:p-0",
      )}
    >
      <Trash2 className="size-4.5 shrink-0" aria-hidden />
      <span className="ml-1.5 max-mobile:sr-only">Delete</span>
    </PillButton>
  );
});
