"use client"

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useFieldArray, useForm, useWatch } from "react-hook-form"

import { Plus, WhatsApp } from "@/components/icons"
import { Card } from "@/components/ui/custom/card"
import { FieldLabel } from "@/components/ui/custom/field-label"
import { InputField } from "@/components/ui/custom/input-field"
import { PillButton } from "@/components/ui/custom/pill-button"
import { TextareaField } from "@/components/ui/custom/textarea-field"
import { InvoiceEditSchema, type InvoiceEditFormData } from "@/lib/schema/invoice"
import type { InvoiceDetail } from "@/lib/types/invoice"
import { formatRupees } from "@/lib/utils"

import { InvoiceEditItemsMobile } from "./invoice-edit-items-mobile"
import { InvoiceEditItemsTable } from "./invoice-edit-items-table"
import { InvoiceEditLivePreview } from "./invoice-edit-live-preview"

interface InvoiceEditFormProps {
  invoice: InvoiceDetail
}

// Private helper — only used in this file
function TotalsStrip({
  subtotal,
  tax,
  total,
}: {
  subtotal: number
  tax: number
  total: number
}) {
  return (
    <div className="flex justify-end">
      <div className="w-65 space-y-1">
        <div className="flex justify-between text-body-sm text-ink-2">
          <span>Subtotal</span>
          <span className="tabular">{formatRupees(subtotal)}</span>
        </div>
        <div className="flex justify-between text-body-sm text-ink-2">
          <span>GST · 5%</span>
          <span className="tabular">{formatRupees(tax)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-body-sm font-extrabold">Total</span>
          <span className="tabular text-26 font-extrabold tracking-tight">
            {formatRupees(total)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function InvoiceEditForm({ invoice }: InvoiceEditFormProps) {
  const form = useForm<InvoiceEditFormData>({
    resolver: standardSchemaResolver(InvoiceEditSchema),
    defaultValues: {
      customerName: invoice.customer,
      phone: "+91 90123 45678",
      email: "",
      items: invoice.items.map((it) => ({
        name: it.name,
        qty: it.qty,
        price: it.unitPrice,
      })),
      notes: invoice.notes ?? "",
    },
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const watchedItems = useWatch({ control, name: "items" })
  const watchedCustomerName = useWatch({ control, name: "customerName" })
  const watchedPhone = useWatch({ control, name: "phone" })

  const subtotal = watchedItems.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0
  )
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax

  const onSubmit = (data: InvoiceEditFormData) => {
    // TODO: wire to Server Action
    console.log("Invoice edit submitted:", data)
  }

  return (
    <form
      aria-label="Edit invoice"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-[1fr_480px] max-tablet:grid-cols-1 gap-5">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <CustomerCard register={register} errors={errors} />

          <Card
            title="Items"
            headingLevel={3}
            action={
              <PillButton
                tone="secondary"
                size="sm"
                type="button"
                onClick={() => append({ name: "", qty: 1, price: 0 })}
              >
                <Plus aria-hidden />
                Add item
              </PillButton>
            }
          >
            <div className="px-6 py-5 flex flex-col gap-0">
              <InvoiceEditItemsTable
                fields={fields}
                register={register}
                remove={remove}
              />
              <InvoiceEditItemsMobile
                fields={fields}
                register={register}
                remove={remove}
              />
              <hr className="my-4 border-t border-border" />
              <TotalsStrip subtotal={subtotal} tax={tax} total={total} />
            </div>
          </Card>

          <Card title="Notes" headingLevel={3}>
            <div className="px-6 py-5">
              <FieldLabel htmlFor="notes" className="sr-only">Notes</FieldLabel>
              <TextareaField
                id="notes"
                rows={3}
                className="w-full"
                placeholder="Add a thank-you note or payment terms..."
                {...register("notes")}
              />
            </div>
          </Card>

          <DesktopActionBar />
        </div>

        {/* Right column — live preview */}
        <div className="sticky top-23 self-start max-mobile:static">
          <p className="mb-2 pl-1 text-kicker uppercase text-ink-3">
            Live preview
          </p>
          <InvoiceEditLivePreview
            invoiceIdNoHash={invoice.id.replace("#", "")}
            customerName={watchedCustomerName}
            phone={watchedPhone}
            items={watchedItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            isoDate={invoice.isoDate}
            dueIsoDate={invoice.dueIsoDate}
          />
        </div>
      </div>
    </form>
  )
}

// Private helpers — used only in this file

function CustomerCard({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<InvoiceEditFormData>>["register"]
  errors: ReturnType<typeof useForm<InvoiceEditFormData>>["formState"]["errors"]
}) {
  return (
    <Card title="Customer" headingLevel={3}>
      <div className="grid grid-cols-2 max-mobile:grid-cols-1 gap-3 px-6 py-5">
        <div>
          <FieldLabel htmlFor="customerName">Customer name</FieldLabel>
          <InputField
            id="customerName"
            size="web"
            className="w-full"
            aria-invalid={!!errors.customerName}
            aria-describedby={errors.customerName ? "customerName-error" : undefined}
            {...register("customerName")}
          />
          {errors.customerName && (
            <span
              id="customerName-error"
              role="alert"
              className="mt-1 block text-caption text-overdue"
            >
              {errors.customerName.message}
            </span>
          )}
        </div>
        <div>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <InputField
            id="phone"
            type="tel"
            autoComplete="tel"
            size="web"
            className="w-full"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
          />
          {errors.phone && (
            <span
              id="phone-error"
              role="alert"
              className="mt-1 block text-caption text-overdue"
            >
              {errors.phone.message}
            </span>
          )}
        </div>
        <div className="col-span-2 max-mobile:col-span-1">
          <FieldLabel htmlFor="email">
            Email{" "}
            <span className="text-ink-3 font-normal normal-case">
              (optional)
            </span>
          </FieldLabel>
          <InputField
            id="email"
            type="email"
            autoComplete="email"
            size="web"
            className="w-full"
            placeholder="customer@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <span
              id="email-error"
              role="alert"
              className="mt-1 block text-caption text-overdue"
            >
              {errors.email.message}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

function DesktopActionBar() {
  return (
    <div className="flex items-center justify-end gap-2.5 flex-wrap max-mobile:hidden">
      <PillButton tone="outline" type="button">
        Save as draft
      </PillButton>
      <PillButton tone="whatsapp" type="submit">
        <WhatsApp aria-hidden />
        Send on WhatsApp
      </PillButton>
    </div>
  )
}
