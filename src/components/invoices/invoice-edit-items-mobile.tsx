"use client"

import type { UseFormRegister } from "react-hook-form"

import { Trash2 } from "@/components/icons"
import { FieldLabel } from "@/components/ui/custom/field-label"
import { IconButton } from "@/components/ui/custom/icon-button"
import { InputField } from "@/components/ui/custom/input-field"
import type { InvoiceEditFormData } from "@/lib/schema/invoice"
import { formatRupees } from "@/lib/utils"

interface InvoiceEditItemsMobileProps {
  fields: Array<{ id: string; name: string; qty: number; price: number }>
  register: UseFormRegister<InvoiceEditFormData>
  remove: (index: number) => void
}

export function InvoiceEditItemsMobile({
  fields,
  register,
  remove,
}: InvoiceEditItemsMobileProps) {
  return (
    <div className="min-mobile:hidden flex flex-col gap-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-lg bg-background border border-border p-3.5 pb-4"
        >
          {/* Card head */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-kicker uppercase text-coral-press">
              Item {index + 1}
            </div>
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
            size="web"
            className="w-full"
            placeholder="What are you billing for?"
            {...register(`items.${index}.name`)}
          />

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
                className="w-full tabular"
                {...register(`items.${index}.qty`, { valueAsNumber: true })}
              />
            </div>

            {/* Price */}
            <div>
              <FieldLabel htmlFor={`item-price-${field.id}`}>Price</FieldLabel>
              <InputField
                id={`item-price-${field.id}`}
                type="number"
                inputMode="numeric"
                min={0}
                className="w-full tabular"
                {...register(`items.${index}.price`, { valueAsNumber: true })}
              />
            </div>

            {/* Total — read-only display, not an input; plain label to avoid orphan <label> */}
            <div>
              <p className="mb-1.5 text-label font-bold text-ink-2">
                Total
              </p>
              <div className="flex h-11 items-center justify-end rounded-nav-item bg-coral-soft px-3.5 text-title-sm font-extrabold text-coral-ink tabular">
                {formatRupees((field.qty || 0) * (field.price || 0))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
