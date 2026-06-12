// No "use client": this body owns no hooks/state. It is always composed inside
// the (client) invoice forms, so it rides their client boundary; the
// interactive children (CustomerPicker, items editors) carry their own.

import type { Control, UseFormRegister } from "react-hook-form";
import type React from "react";

import { Plus } from "@/components/icons";
import { Card } from "@/components/ui/custom/card";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { PillButton } from "@/components/ui/custom/pill-button";
import { TextareaField } from "@/components/ui/custom/textarea-field";
import type { DraftFormData } from "@/lib/schema/invoice";
import type { SelectedCustomer } from "@/lib/types/customer";

import { InvoiceFormCustomerPicker } from "./invoice-form-customer-picker";
import { InvoiceFormItemsMobile } from "./invoice-form-items-mobile";
import { InvoiceFormItemsTable } from "./invoice-form-items-table";
import { InvoiceFormStepHeader } from "./invoice-form-step-header";
import { InvoiceFormTotalsStrip } from "./invoice-form-totals-strip";

// ── Types ──────────────────────────────────────────────────────────────────

export interface InvoiceFormBodyProps {
  customer: SelectedCustomer | null;
  onSelectCustomer: (c: SelectedCustomer) => void;
  onClearCustomer: () => void;
  fields: Array<{
    id: string;
    name: string;
    qty: number;
    unit_price: number;
    discount: number;
    gst_rate: number;
  }>;
  register: UseFormRegister<DraftFormData>;
  control: Control<DraftFormData>;
  onAddItem: () => void;
  onRemoveItem: (i: number) => void;
  onOpenPicker: () => void;
  subtotal: number;
  taxTotal: number;
  total: number;
  preview: React.ReactNode;
  actionBar: React.ReactNode;
}

// ── Main export ────────────────────────────────────────────────────────────

export function InvoiceFormBody({
  customer,
  onSelectCustomer,
  onClearCustomer,
  fields,
  register,
  control,
  onAddItem,
  onRemoveItem,
  onOpenPicker,
  subtotal,
  taxTotal,
  total,
  preview,
  actionBar,
}: InvoiceFormBodyProps) {
  const itemsValid = fields.some(
    (it) => it.name && (Number(it.qty) || 0) * (Number(it.unit_price) || 0) > 0,
  );

  return (
    <div className="grid grid-cols-[1fr_480px] max-tablet:grid-cols-1 gap-5">
      {/* Left column — 3-step form */}
      <div className="flex flex-col gap-4">
        {/* Step 1 — Customer.
            overflow-visible so the customer combobox dropdown (absolute, z-30)
            can escape the card and float over the cards below instead of being
            clipped by the brand Card's default overflow-hidden. */}
        <Card className="overflow-visible">
          <div className="px-6 py-5">
            <InvoiceFormStepHeader
              n={1}
              title="Pick a customer"
              hint="Search your saved customer list, or add a new one."
              done={!!customer}
            />
            <InvoiceFormCustomerPicker
              value={customer}
              onSelect={onSelectCustomer}
              onClear={onClearCustomer}
            />
          </div>
        </Card>

        {/* Step 2 — Items */}
        <Card>
          <div className="px-6 py-5">
            <InvoiceFormStepHeader
              n={2}
              title="Add what you sold"
              hint="Item name, quantity, price. The total updates live."
              done={itemsValid}
            />
            {/* Items eyebrow row */}
            <div className="flex items-center gap-2 mt-1 mb-3">
              <span className="text-kicker font-extrabold uppercase tracking-wide text-ink-3 mr-auto">
                Items
              </span>
              <PillButton tone="ghost" size="sm" type="button" onClick={onOpenPicker}>
                From saved
              </PillButton>
              <PillButton tone="secondary" size="sm" type="button" onClick={onAddItem}>
                <Plus strokeWidth={2.4} aria-hidden />
                Add item
              </PillButton>
            </div>
            <InvoiceFormItemsTable
              fields={fields}
              register={register}
              control={control}
              remove={onRemoveItem}
            />
            <InvoiceFormItemsMobile
              fields={fields}
              register={register}
              control={control}
              remove={onRemoveItem}
            />
            <hr className="my-3.5 border-t border-border" />
            <InvoiceFormTotalsStrip subtotal={subtotal} taxTotal={taxTotal} total={total} />
          </div>
        </Card>

        {/* Step 3 — Notes */}
        <Card>
          <div className="px-6 py-5">
            <InvoiceFormStepHeader
              n={3}
              title="Notes & terms"
              hint="Add a thank-you or payment terms. Optional."
            />
            <FieldLabel htmlFor="notes" className="sr-only">
              Notes
            </FieldLabel>
            <TextareaField
              id="notes"
              rows={3}
              className="w-full"
              placeholder="Add a thank-you note or payment terms..."
              {...register("notes")}
            />
          </div>
        </Card>

        {actionBar}
      </div>

      {/* Right column — desktop live preview sidebar only.
          Hidden on mobile: the user reaches the preview via the Review screen
          (InvoiceFormReviewStage) that the mobile sticky bar navigates to. */}
      <div className="sticky top-23 self-start max-mobile:hidden">{preview}</div>
    </div>
  );
}
