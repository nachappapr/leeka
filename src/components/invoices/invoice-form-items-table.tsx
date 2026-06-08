"use client"

import type { UseFormRegister } from "react-hook-form"

import { Trash2 } from "@/components/icons"
import { IconButton } from "@/components/ui/custom/icon-button"
import { InputField } from "@/components/ui/custom/input-field"
import type { InvoiceEditFormData } from "@/lib/schema/invoice"
import { formatRupees } from "@/lib/utils"

interface InvoiceFormItemsTableProps {
  fields: Array<{ id: string; name: string; qty: number; price: number }>
  register: UseFormRegister<InvoiceEditFormData>
  remove: (index: number) => void
}

export function InvoiceFormItemsTable({
  fields,
  register,
  remove,
}: InvoiceFormItemsTableProps) {
  return (
    <div className="max-mobile:hidden">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_110px_110px_40px] max-tablet:grid-cols-[1fr_60px_90px_100px_36px] gap-3 max-tablet:gap-2 pb-2 border-b border-border">
        <div className="text-kicker font-extrabold uppercase text-ink-3">
          Description
        </div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">
          Qty
        </div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">
          Price
        </div>
        <div className="text-kicker font-extrabold uppercase text-ink-3 text-right">
          Total
        </div>
        <div />
      </div>

      {/* Item rows */}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid grid-cols-[1fr_80px_110px_110px_40px] max-tablet:grid-cols-[1fr_60px_90px_100px_36px] gap-3 max-tablet:gap-2 py-1.5 border-b border-border last:border-b-0 items-center"
        >
          {/* Name */}
          <InputField
            size="bare"
            aria-label={`Description for item ${index + 1}`}
            className="w-full"
            placeholder="What are you billing for?"
            {...register(`items.${index}.name`)}
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

          {/* Price */}
          <InputField
            type="number"
            inputMode="numeric"
            min={0}
            size="bare"
            aria-label={`Price for item ${index + 1}`}
            className="w-full text-right tabular"
            {...register(`items.${index}.price`, { valueAsNumber: true })}
          />

          {/* Total (read-only computed) */}
          <div className="text-right font-extrabold tabular text-body-sm">
            {formatRupees((field.qty || 0) * (field.price || 0))}
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
  )
}
