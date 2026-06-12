"use client";

// Justified "use client": owns useForm, useFieldArray, useWatch, useState
// (customer + view), useTransition, useRouter, and event handler callbacks.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { saveInvoiceDraft } from "@/app/(app)/invoices/actions";
import { DraftFormSchema, type DraftFormData } from "@/lib/schema/invoice";
import type { SelectedCustomer } from "@/lib/types/customer";
import type { Invoice } from "@/lib/types";
import type { SavedItem } from "@/lib/types/item";
import { estimateDraftTotals, toDraftSavePayload } from "@/lib/invoice/draft-form";
import { hasTotalsMismatch } from "@/lib/invoice/reconcile-totals";
import { formatRupees } from "@/lib/utils";
import { useViewFocusSwap } from "@/hooks/use-view-focus-swap";

import { InvoiceCreateHeader } from "./invoice-create-header";
import { InvoiceFormBody } from "./invoice-form-body";
import { InvoiceFormDesktopActionBar } from "./invoice-form-desktop-action-bar";
import { InvoiceFormItemPicker } from "./invoice-form-item-picker";
import { InvoiceFormEditMobileBar } from "./invoice-form-edit-mobile-bar";
import { InvoiceFormPreviewSidebar } from "./invoice-form-preview-sidebar";
import { InvoiceFormReviewView } from "./invoice-form-review-view";

interface InvoiceCreateFormProps {
  isoDate: string;
  dueIsoDate: string;
  businessGstEnabled: boolean;
  businessStateCode: string | null;
  businessDefaultGstRate: number;
}

const BASE_EMPTY_ITEM = { name: "", hsn_sac: "", qty: 1, unit_price: 0, discount: 0 };

export function InvoiceCreateForm({
  isoDate,
  dueIsoDate,
  businessGstEnabled,
  businessStateCode,
  businessDefaultGstRate,
}: InvoiceCreateFormProps) {
  const router = useRouter();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [customer, setCustomer] = useState<SelectedCustomer | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { reviewHeadingRef, previewBtnRef } = useViewFocusSwap(view);

  const emptyItem = { ...BASE_EMPTY_ITEM, gst_rate: businessDefaultGstRate };

  const form = useForm<DraftFormData>({
    resolver: standardSchemaResolver(DraftFormSchema),
    defaultValues: { items: [{ ...emptyItem }], notes: "" },
  });

  const { register, control, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  // Mirror the server action's isInterstate derivation (actions.ts:131-134):
  // false when either state_code absent; true only when both present and differ.
  const isInterstate =
    Boolean(businessStateCode) &&
    Boolean(customer?.state_code) &&
    businessStateCode !== customer?.state_code;

  const estimate = estimateDraftTotals(watchedItems, {
    gstEnabled: businessGstEnabled,
    isInterstate,
  });

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
      gst_rate: businessDefaultGstRate,
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
      const result = await saveInvoiceDraft(toDraftSavePayload(customer.id, data));
      if (result.ok) {
        if (hasTotalsMismatch(estimate, result.data)) {
          setSubmitError("Saved totals did not match the preview. Please review and try again.");
          return;
        }
        router.push(`/invoices/${result.data.invoiceId}`);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  const syntheticInvoice: Invoice = {
    id: "draft",
    customer: customer?.name ?? "New customer",
    city: "",
    isoDate,
    amount: formatRupees(estimate.total / 100),
    status: "draft",
  };

  if (view === "preview") {
    return (
      <InvoiceFormReviewView
        invoiceIdNoHash=""
        customerName={customer?.name ?? ""}
        phone={customer?.phone ?? ""}
        items={watchedItems}
        subtotal={estimate.subtotal}
        total={estimate.total}
        cgst={estimate.cgst}
        sgst={estimate.sgst}
        igst={estimate.igst}
        roundOff={estimate.round_off}
        isoDate={isoDate}
        dueIsoDate={dueIsoDate}
        invoice={syntheticInvoice}
        onBack={() => setView("edit")}
        onDiscard={() => router.push("/invoices")}
        headingRef={reviewHeadingRef}
      />
    );
  }

  return (
    <>
      <InvoiceCreateHeader />
      <form aria-label="Create invoice" onSubmit={handleSubmit(onSubmit)}>
        <InvoiceFormBody
          customer={customer}
          onSelectCustomer={handleSelectCustomer}
          onClearCustomer={handleClearCustomer}
          fields={fields}
          register={register}
          control={control}
          onAddItem={() => append({ ...emptyItem })}
          onRemoveItem={remove}
          onOpenPicker={() => setPickerOpen(true)}
          subtotal={estimate.subtotal / 100}
          total={estimate.total / 100}
          cgst={estimate.cgst / 100}
          sgst={estimate.sgst / 100}
          igst={estimate.igst / 100}
          roundOff={estimate.round_off / 100}
          preview={
            <InvoiceFormPreviewSidebar
              invoiceIdNoHash=""
              customerName={customer?.name ?? ""}
              phone={customer?.phone ?? ""}
              items={watchedItems}
              subtotal={estimate.subtotal}
              total={estimate.total}
              cgst={estimate.cgst}
              sgst={estimate.sgst}
              igst={estimate.igst}
              roundOff={estimate.round_off}
              isoDate={isoDate}
              dueIsoDate={dueIsoDate}
            />
          }
          actionBar={
            <InvoiceFormDesktopActionBar
              canSend={canSend}
              isPending={isPending}
              invoice={syntheticInvoice}
              onDiscard={() => router.push("/invoices")}
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
        onDiscard={() => router.push("/invoices")}
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
