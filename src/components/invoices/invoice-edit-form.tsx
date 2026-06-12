"use client";

// Justified "use client": owns useForm, useFieldArray, useWatch, useState
// (customer + view), useTransition, useRouter, and event handler callbacks.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { saveInvoiceDraft } from "@/app/(app)/invoices/actions";
import { DraftFormSchema, type DraftFormData } from "@/lib/schema/invoice";
import type { SelectedCustomer } from "@/lib/types/customer";
import type { Invoice } from "@/lib/types";
import type { SavedItem } from "@/lib/types/item";
import type { DraftInvoiceData } from "@/lib/data/invoice";
import { estimateDraftTotals, toDraftSavePayload } from "@/lib/invoice/draft-form";
import { formatRupees } from "@/lib/utils";

import { InvoiceEditHeader } from "./invoice-edit-header";
import { InvoiceFormBody } from "./invoice-form-body";
import { InvoiceFormDesktopActionBar } from "./invoice-form-desktop-action-bar";
import { InvoiceFormEditMobileBar } from "./invoice-form-edit-mobile-bar";
import { InvoiceFormPreviewSidebar } from "./invoice-form-preview-sidebar";
import { InvoiceFormReviewView } from "./invoice-form-review-view";
import { fireDeleteInvoiceToast } from "./invoice-form-delete-button";
import { InvoiceFormItemPicker } from "./invoice-form-item-picker";

interface InvoiceEditFormProps {
  draft: DraftInvoiceData;
  isoDate: string;
  dueIsoDate: string;
}

export function InvoiceEditForm({ draft, isoDate, dueIsoDate }: InvoiceEditFormProps) {
  const router = useRouter();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [customer, setCustomer] = useState<SelectedCustomer | null>({
    id: draft.customerId,
    name: draft.customerName,
    phone: draft.customerPhone,
  });

  // Focus management (WCAG 2.4.3): swap focus to the review heading on
  // edit→preview, restore to the preview CTA on preview→edit.
  // hasMountedRef prevents focus theft on the initial render.
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const previewBtnRef = useRef<HTMLButtonElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (view === "preview") reviewHeadingRef.current?.focus();
    else previewBtnRef.current?.focus();
  }, [view]);

  const form = useForm<DraftFormData>({
    resolver: standardSchemaResolver(DraftFormSchema),
    defaultValues: {
      items: draft.items.map((it) => ({
        name: it.name,
        hsn_sac: it.hsn_sac ?? "",
        qty: it.qty,
        unit_price: it.unit_price,
        discount: it.discount,
        gst_rate: it.gst_rate,
      })),
      notes: draft.notes ?? "",
    },
  });

  const { register, control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  const estimate = estimateDraftTotals(watchedItems);

  const itemsValid = watchedItems.some(
    (it) => it.name && (Number(it.qty) || 0) * (Number(it.unit_price) || 0) > 0,
  );
  const canSend = !!customer && itemsValid;
  const sendDisabledMsg = !customer
    ? "Pick a customer first"
    : !itemsValid
      ? "Add at least one item with a price"
      : undefined;

  function handleSelectCustomer(c: SelectedCustomer) {
    setCustomer(c);
  }
  function handleClearCustomer() {
    setCustomer(null);
  }

  // Paise ↔ rupee boundary: SavedItem.default_price is in rupees; convert ×100.
  function handleAddFromSaved(item: SavedItem) {
    append({
      name: item.name,
      hsn_sac: "",
      qty: 1,
      unit_price: Math.round((item.default_price ?? 0) * 100),
      discount: 0,
      gst_rate: 5,
    });
    setPickerOpen(false);
  }

  const onSubmit = (data: DraftFormData) => {
    if (!customer) {
      setSubmitError("Please select a customer before saving.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveInvoiceDraft(toDraftSavePayload(customer.id, data, draft.invoiceId));
      if (result.ok) router.push(`/invoices/${draft.invoiceId}`);
      else setSubmitError(result.error);
    });
  };

  function handleDeleteInvoice() {
    fireDeleteInvoiceToast(draft.invoiceId, () => router.push("/invoices"));
  }

  const syntheticInvoice: Invoice = {
    id: draft.invoiceId,
    customer: customer?.name ?? draft.customerName,
    city: "",
    isoDate,
    amount: formatRupees(estimate.total / 100),
    status: "draft",
  };

  if (view === "preview") {
    return (
      <InvoiceFormReviewView
        invoiceIdNoHash={draft.invoiceId}
        customerName={customer?.name ?? draft.customerName}
        phone={customer?.phone ?? draft.customerPhone}
        items={watchedItems}
        subtotal={estimate.subtotal}
        taxTotal={estimate.tax_total}
        total={estimate.total}
        isoDate={isoDate}
        dueIsoDate={dueIsoDate}
        invoice={syntheticInvoice}
        onBack={() => setView("edit")}
        onDiscard={() => router.push(`/invoices/${draft.invoiceId}`)}
        headingRef={reviewHeadingRef}
      />
    );
  }

  return (
    <>
      <InvoiceEditHeader id={draft.invoiceId} customer={draft.customerName} />
      <form aria-label="Edit invoice" onSubmit={handleSubmit(onSubmit)}>
        <InvoiceFormBody
          customer={customer}
          onSelectCustomer={handleSelectCustomer}
          onClearCustomer={handleClearCustomer}
          fields={fields}
          register={register}
          control={control}
          onAddItem={() =>
            append({ name: "", hsn_sac: "", qty: 1, unit_price: 0, discount: 0, gst_rate: 5 })
          }
          onRemoveItem={remove}
          onOpenPicker={() => setPickerOpen(true)}
          subtotal={estimate.subtotal / 100}
          taxTotal={estimate.tax_total / 100}
          total={estimate.total / 100}
          preview={
            <InvoiceFormPreviewSidebar
              invoiceIdNoHash={draft.invoiceId}
              customerName={customer?.name ?? draft.customerName}
              phone={customer?.phone ?? draft.customerPhone}
              items={watchedItems}
              subtotal={estimate.subtotal}
              taxTotal={estimate.tax_total}
              total={estimate.total}
              isoDate={isoDate}
              dueIsoDate={dueIsoDate}
            />
          }
          actionBar={
            <InvoiceFormDesktopActionBar
              mode="edit"
              canSend={canSend}
              isPending={isPending}
              invoice={syntheticInvoice}
              onDiscard={() => router.push(`/invoices/${draft.invoiceId}`)}
              discardLabel="Discard changes"
              onDelete={handleDeleteInvoice}
            />
          }
        />
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-3 text-body-sm text-overdue"
        >
          {submitError ?? ""}
        </p>
      </form>
      <InvoiceFormEditMobileBar
        canPreview={canSend}
        isPending={isPending}
        previewDisabledMsg={sendDisabledMsg}
        onPreview={() => setView("preview")}
        onDiscard={() => router.push(`/invoices/${draft.invoiceId}`)}
        onDelete={handleDeleteInvoice}
        invoice={syntheticInvoice}
        buttonRef={previewBtnRef}
      />
      <InvoiceFormItemPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAddFromSaved}
      />
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending ? "Saving draft…" : ""}
      </span>
    </>
  );
}
