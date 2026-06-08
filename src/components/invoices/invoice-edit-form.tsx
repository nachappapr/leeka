"use client"

// Justified "use client": owns useForm, useFieldArray, useWatch, useState
// (customer + view), useRouter, and event handler callbacks.

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useFieldArray, useForm, useWatch } from "react-hook-form"

import { InvoiceEditSchema, type InvoiceEditFormData } from "@/lib/schema/invoice"
import type { SelectedCustomer } from "@/lib/types/customer"
import type { Invoice, InvoiceDetail } from "@/lib/types"
import { formatRupees } from "@/lib/utils"

import { InvoiceEditHeader } from "./invoice-edit-header"
import { InvoiceFormBody } from "./invoice-form-body"
import { InvoiceFormDesktopActionBar } from "./invoice-form-desktop-action-bar"
import { InvoiceFormEditMobileBar } from "./invoice-form-edit-mobile-bar"
import { InvoiceFormPreviewMobileBar } from "./invoice-form-preview-mobile-bar"
import { InvoiceFormPreviewSidebar } from "./invoice-form-preview-sidebar"
import { InvoiceFormReviewHeader } from "./invoice-form-review-header"
import { InvoiceFormReviewStage } from "./invoice-form-review-stage"

interface InvoiceEditFormProps {
  invoice: InvoiceDetail
}

export function InvoiceEditForm({ invoice }: InvoiceEditFormProps) {
  const router = useRouter()
  const [view, setView] = useState<"edit" | "preview">("edit")
  // Pre-populate customer from invoice data
  const [customer, setCustomer] = useState<SelectedCustomer | null>({
    name: invoice.customer,
    phone: "+91 90123 45678",
  })

  // Focus management for view swap (WCAG 2.4.3). When the view changes from
  // "edit" → "preview" we move focus to the review heading so assistive
  // technology announces the new context. When returning "preview" → "edit"
  // we restore focus to the "Preview invoice" CTA that triggered the swap.
  // hasMountedRef guards the initial render so NO focus is stolen on page load.
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null)
  const previewBtnRef = useRef<HTMLButtonElement>(null)
  const hasMountedRef = useRef(false)

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (view === "preview") {
      reviewHeadingRef.current?.focus()
    } else {
      previewBtnRef.current?.focus()
    }
  }, [view])

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

  const { register, control, handleSubmit, setValue } = form
  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const watchedItems = useWatch({ control, name: "items" })

  const subtotal = watchedItems.reduce(
    (s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0),
    0,
  )
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax

  const itemsValid = fields.some(
    (it) => it.name && (Number(it.qty) || 0) * (Number(it.price) || 0) > 0,
  )
  const canSend = !!customer && itemsValid
  const sendDisabledMsg = !customer
    ? "Pick a customer first"
    : !itemsValid
      ? "Add at least one item with a price"
      : undefined

  function handleSelectCustomer(c: SelectedCustomer) {
    setCustomer(c)
    setValue("customerName", c.name)
    setValue("phone", c.phone)
  }

  function handleClearCustomer() {
    setCustomer(null)
    setValue("customerName", "")
    setValue("phone", "")
  }

  const onSubmit = (data: InvoiceEditFormData) => {
    // TODO: wire to Server Action
    console.log("Invoice edit submitted:", data)
  }

  const invoiceIdNoHash = invoice.id.replace("#", "")

  // Synthesized Invoice for SendChannelsModal
  const syntheticInvoice: Invoice = {
    id: invoice.id,
    customer: customer?.name ?? invoice.customer,
    city: invoice.city,
    isoDate: invoice.isoDate,
    amount: formatRupees(total),
    status: "draft",
  }

  if (view === "preview") {
    return (
      <>
        <InvoiceFormReviewHeader
          customerName={customer?.name ?? invoice.customer}
          onBack={() => setView("edit")}
          headingRef={reviewHeadingRef}
        />
        <InvoiceFormReviewStage
          invoiceIdNoHash={invoiceIdNoHash}
          customerName={customer?.name ?? invoice.customer}
          phone={customer?.phone ?? "+91 90123 45678"}
          items={watchedItems}
          subtotal={subtotal}
          tax={tax}
          total={total}
          isoDate={invoice.isoDate}
          dueIsoDate={invoice.dueIsoDate}
          invoice={syntheticInvoice}
          onBack={() => setView("edit")}
        />
        <InvoiceFormPreviewMobileBar
          invoice={syntheticInvoice}
          onEdit={() => setView("edit")}
          onDiscard={() => router.push(`/invoices/${invoiceIdNoHash}`)}
        />
      </>
    )
  }

  return (
    <>
      <InvoiceEditHeader id={invoiceIdNoHash} customer={invoice.customer} />
      <form aria-label="Edit invoice" onSubmit={handleSubmit(onSubmit)}>
        <InvoiceFormBody
          customer={customer}
          onSelectCustomer={handleSelectCustomer}
          onClearCustomer={handleClearCustomer}
          fields={fields}
          register={register}
          onAddItem={() => append({ name: "", qty: 1, price: 0 })}
          onRemoveItem={remove}
          subtotal={subtotal}
          tax={tax}
          total={total}
          preview={
            <InvoiceFormPreviewSidebar
              invoiceIdNoHash={invoiceIdNoHash}
              customerName={customer?.name ?? invoice.customer}
              phone={customer?.phone ?? "+91 90123 45678"}
              items={watchedItems}
              subtotal={subtotal}
              tax={tax}
              total={total}
              isoDate={invoice.isoDate}
              dueIsoDate={invoice.dueIsoDate}
            />
          }
          actionBar={
            <InvoiceFormDesktopActionBar
              canSend={canSend}
              invoice={syntheticInvoice}
              onDiscard={() => router.push(`/invoices/${invoiceIdNoHash}`)}
              discardLabel="Discard changes"
            />
          }
        />
      </form>
      <InvoiceFormEditMobileBar
        canPreview={canSend}
        previewDisabledMsg={sendDisabledMsg}
        onPreview={() => setView("preview")}
        onDiscard={() => router.push(`/invoices/${invoiceIdNoHash}`)}
        invoice={syntheticInvoice}
        buttonRef={previewBtnRef}
      />
    </>
  )
}
