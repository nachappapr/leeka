"use client";

import type { Control, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Trash2 } from "@/components/icons";
import { BrandSelect } from "@/components/ui/custom/brand-select";
import { IconButton } from "@/components/ui/custom/icon-button";
import { InputField } from "@/components/ui/custom/input-field";
import { GST_RATE_OPTIONS } from "@/lib/constants/invoices";
import { formatRupees } from "@/lib/utils";
import type { DraftFormData } from "@/lib/schema/invoice";

// paise → rupees for display
function paiseToRupees(paise: number): number {
  return paise / 100;
}

interface InvoiceFormItemsTableProps {
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

export function InvoiceFormItemsTable({
  fields,
  register,
  control,
  remove,
}: InvoiceFormItemsTableProps) {
  return (
    <div>
      {/* Header row — 8-col grid: Name | HSN | Qty | Price | Disc | GST | Total | Del */}
      <div className="grid grid-cols-[1fr_90px_60px_100px_90px_80px_100px_40px] gap-2 pb-2 border-b border-border">
        <div className="text-kicker font-extrabold uppercase text-ink-3">Description</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3">HSN/SAC</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">Qty</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">Price (₹)</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">Disc (₹)</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">GST</div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">Total</div>
        <div />
      </div>

      {/* Item rows */}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-[1fr_90px_60px_100px_90px_80px_100px_40px] gap-2 py-1.5 border-b border-border last:border-b-0 items-center"
        >
          {/* Name */}
          <InputField
            size="bare"
            aria-label={`Description for item ${index + 1}`}
            className="w-full"
            placeholder="Item name"
            {...register(`items.${index}.name`)}
          />

          {/* HSN/SAC */}
          <InputField
            size="bare"
            aria-label={`HSN/SAC code for item ${index + 1}`}
            className="w-full"
            placeholder="Optional"
            {...register(`items.${index}.hsn_sac`)}
          />

          {/* Qty */}
          <InputField
            type="number"
            inputMode="numeric"
            min={0}
            size="bare"
            aria-label={`Quantity for item ${index + 1}`}
            className="w-full text-right tabular"
            {...register(`items.${index}.qty`, { valueAsNumber: true })}
          />

          {/* Unit price — rupees input; paise stored in form state via Controller */}
          {/* Paise ↔ rupee boundary: display and input in rupees (÷100 / ×100). */}
          <Controller
            control={control}
            name={`items.${index}.unit_price`}
            render={({ field: f }) => (
              <InputField
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                size="bare"
                aria-label={`Unit price in rupees for item ${index + 1}`}
                className="w-full text-right tabular"
                value={paiseToRupees(f.value)}
                onChange={(e) => f.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))}
                onBlur={f.onBlur}
              />
            )}
          />

          {/* Discount — rupees input; paise stored in form state via Controller */}
          {/* Paise ↔ rupee boundary: display and input in rupees (÷100 / ×100). */}
          <Controller
            control={control}
            name={`items.${index}.discount`}
            render={({ field: f }) => (
              <InputField
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                size="bare"
                aria-label={`Discount in rupees for item ${index + 1}`}
                className="w-full text-right tabular"
                value={paiseToRupees(f.value)}
                onChange={(e) => f.onChange(Math.round((parseFloat(e.target.value) || 0) * 100))}
                onBlur={f.onBlur}
              />
            )}
          />

          {/* GST rate selector */}
          <Controller
            control={control}
            name={`items.${index}.gst_rate`}
            render={({ field: f }) => (
              <BrandSelect
                value={String(f.value)}
                onValueChange={(v) => f.onChange(parseFloat(v))}
                options={GST_RATE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                ariaLabel={`GST rate for item ${index + 1}`}
                className="h-8 text-body-sm px-2 rounded-sm"
              />
            )}
          />

          {/* Line total (read-only computed, in rupees for display) */}
          <div className="text-right font-extrabold tabular text-body-sm">
            {formatRupees(
              paiseToRupees(Math.max(0, Math.round(field.qty * field.unit_price) - field.discount)),
            )}
          </div>

          {/* Delete */}
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
      ))}
    </div>
  );
}
