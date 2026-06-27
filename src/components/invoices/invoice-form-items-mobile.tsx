"use client";

import type { Control, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Trash2 } from "@/components/icons";
import { BrandSelect } from "@/components/ui/custom/brand-select";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { IconButton } from "@/components/ui/custom/icon-button";
import { InputField } from "@/components/ui/custom/input-field";
import { GST_RATE_OPTIONS } from "@/lib/constants/invoices";
import type { DraftFormData } from "@/lib/schema/invoice";
import { formatRupees } from "@/lib/utils";

// Paise ↔ rupee boundary: display and input in rupees (÷100 / ×100).
function paiseToRupees(paise: number): number {
  return paise / 100;
}

interface InvoiceFormItemsMobileProps {
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
  remove: (index: number) => void;
}

export function InvoiceFormItemsMobile({
  fields,
  register,
  control,
  remove,
}: InvoiceFormItemsMobileProps) {
  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-2xl bg-background border border-border p-3.5 pb-4">
          {/* Card head */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-kicker uppercase text-coral-press">Item {index + 1}</div>
            <IconButton
              type="button"
              tone="destructive"
              size="md"
              aria-label={`Remove item ${index + 1}`}
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" aria-hidden />
            </IconButton>
          </div>

          {/* Item name */}
          <FieldLabel htmlFor={`item-name-${field.id}`}>Item name</FieldLabel>
          <InputField
            id={`item-name-${field.id}`}
            size="mobile"
            className="w-full"
            placeholder="What are you billing for?"
            {...register(`items.${index}.name`)}
          />

          {/* HSN/SAC */}
          <div className="mt-3">
            <FieldLabel htmlFor={`item-hsn-${field.id}`}>HSN/SAC (optional)</FieldLabel>
            <InputField
              id={`item-hsn-${field.id}`}
              size="mobile"
              className="w-full"
              placeholder="e.g. 6305"
              {...register(`items.${index}.hsn_sac`)}
            />
          </div>

          {/* Three-col grid: qty / price / total */}
          <div className="mt-3 grid grid-cols-3 gap-2.5 items-end">
            {/* Qty */}
            <div>
              <FieldLabel htmlFor={`item-qty-${field.id}`}>Qty</FieldLabel>
              <InputField
                id={`item-qty-${field.id}`}
                type="number"
                inputMode="numeric"
                min={0}
                size="mobile"
                className="w-full tabular"
                {...register(`items.${index}.qty`, { valueAsNumber: true })}
              />
            </div>

            {/* Unit price — rupees input; paise stored in form state via Controller */}
            {/* Paise ↔ rupee boundary: display and input in rupees (÷100 / ×100). */}
            <div>
              <FieldLabel htmlFor={`item-price-${field.id}`}>Price (₹)</FieldLabel>
              <Controller
                control={control}
                name={`items.${index}.unit_price`}
                render={({ field: f }) => (
                  <InputField
                    id={`item-price-${field.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    size="mobile"
                    className="w-full tabular"
                    value={paiseToRupees(f.value)}
                    onChange={(e) =>
                      f.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))
                    }
                    onBlur={f.onBlur}
                  />
                )}
              />
            </div>

            {/* Line total (subtotal after discount, read-only, in rupees) */}
            <div>
              <p className="mb-1.5 text-label font-bold text-ink-2">Total</p>
              <div className="flex h-11 items-center justify-end rounded-nav-item bg-coral-soft px-3.5 text-title-sm font-extrabold text-coral-ink tabular">
                {formatRupees(
                  paiseToRupees(
                    Math.max(0, Math.round(field.qty * field.unit_price) - field.discount),
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Second row: discount / GST rate */}
          <div className="mt-3 grid grid-cols-2 gap-2.5 items-end">
            {/* Discount — rupees input; paise stored in form state via Controller */}
            {/* Paise ↔ rupee boundary: display and input in rupees (÷100 / ×100). */}
            <div>
              <FieldLabel htmlFor={`item-disc-${field.id}`}>Discount (₹)</FieldLabel>
              <Controller
                control={control}
                name={`items.${index}.discount`}
                render={({ field: f }) => (
                  <InputField
                    id={`item-disc-${field.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    size="mobile"
                    className="w-full tabular"
                    value={paiseToRupees(f.value)}
                    onChange={(e) =>
                      f.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))
                    }
                    onBlur={f.onBlur}
                  />
                )}
              />
            </div>

            {/* GST rate */}
            <div>
              <FieldLabel htmlFor={`item-gst-${field.id}`}>GST rate</FieldLabel>
              <Controller
                control={control}
                name={`items.${index}.gst_rate`}
                render={({ field: f }) => (
                  <BrandSelect
                    id={`item-gst-${field.id}`}
                    value={String(f.value)}
                    onValueChange={(v) => f.onChange(parseFloat(v))}
                    options={GST_RATE_OPTIONS.map((o) => ({
                      value: String(o.value),
                      label: o.label,
                    }))}
                    ariaLabel={`GST rate for item ${index + 1}`}
                  />
                )}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
