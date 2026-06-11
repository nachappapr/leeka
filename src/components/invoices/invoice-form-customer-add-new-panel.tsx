"use client";

// Justified "use client": owns newName/newPhone/newGstin state via useState.

import * as React from "react";

import { upsertCustomerAction } from "@/app/(app)/customers/actions";
import { Check, ChevronLeft } from "@/components/icons";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { IconButton } from "@/components/ui/custom/icon-button";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import type { SelectedCustomer } from "@/lib/types/customer";

export function InvoiceFormCustomerAddNewPanel({
  initialName,
  onBack,
  onSave,
}: {
  initialName: string;
  onBack: () => void;
  onSave: (c: SelectedCustomer) => void;
}) {
  const [newName, setNewName] = React.useState(initialName);
  const [newPhone, setNewPhone] = React.useState("");
  const [newGstin, setNewGstin] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const canSave = newName.trim().length > 0 && newPhone.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    const result = await upsertCustomerAction({
      name: newName.trim(),
      phone: newPhone.trim(),
      gstin: newGstin.trim() || undefined,
    });
    setSaving(false);
    if (result.ok) {
      onSave({ name: newName.trim(), phone: newPhone.trim() });
    }
  }

  return (
    <div className="rounded-2xl border-[1.5px] border-dashed border-line-strong bg-background p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <IconButton size="sm" aria-label="Back to search" type="button" onClick={onBack}>
          <ChevronLeft className="size-4.5" aria-hidden />
        </IconButton>
        <span className="text-body-sm font-extrabold text-ink">Add new customer</span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-mobile:grid-cols-1">
        <div>
          <FieldLabel htmlFor="cp-new-name">Customer name</FieldLabel>
          <InputField
            id="cp-new-name"
            size="web"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            placeholder="e.g. Sharma Sweets"
            className="text-body"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel htmlFor="cp-new-phone">Phone</FieldLabel>
          <InputField
            id="cp-new-phone"
            size="web"
            type="tel"
            autoComplete="tel"
            placeholder="+91 ..."
            className="text-body"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
        </div>
        <div className="col-span-2 max-mobile:col-span-1">
          <FieldLabel htmlFor="cp-new-gstin">GSTIN (optional)</FieldLabel>
          <InputField
            id="cp-new-gstin"
            size="web"
            placeholder="22AAAAA0000A1Z5"
            className="text-body"
            value={newGstin}
            onChange={(e) => setNewGstin(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3.5 flex justify-end gap-2">
        <PillButton tone="ghost" size="sm" type="button" onClick={onBack}>
          Cancel
        </PillButton>
        <PillButton
          tone="primary"
          size="sm"
          type="button"
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          <Check className="size-3.5" strokeWidth={2.6} aria-hidden />
          Save &amp; use
        </PillButton>
      </div>
    </div>
  );
}
