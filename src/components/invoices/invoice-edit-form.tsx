"use client";

// Justified "use client": consumes useInvoiceEditForm, which owns useForm,
// useFieldArray, useWatch, useState, useTransition, useRouter, and callbacks.

import type { DraftInvoiceData } from "@/lib/data/invoice";

import { InvoiceEditHeader } from "./invoice-edit-header";
import { InvoiceFormBody } from "./invoice-form-body";
import { InvoiceFormDesktopActionBar } from "./invoice-form-desktop-action-bar";
import { InvoiceFormEditMobileBar } from "./invoice-form-edit-mobile-bar";
import { InvoiceFormPreviewSidebar } from "./invoice-form-preview-sidebar";
import { InvoiceFormReviewView } from "./invoice-form-review-view";
import { InvoiceFormItemPicker } from "./invoice-form-item-picker";
import { useInvoiceEditForm } from "./use-invoice-edit-form";

interface InvoiceEditFormProps {
  draft: DraftInvoiceData;
  isoDate: string;
  dueIsoDate: string;
  businessGstEnabled: boolean;
  businessStateCode: string | null;
  businessDefaultGstRate: number;
}

export function InvoiceEditForm({
  draft,
  isoDate,
  dueIsoDate,
  businessGstEnabled,
  businessStateCode,
  businessDefaultGstRate,
}: InvoiceEditFormProps) {
  const {
    view,
    setView,
    customer,
    setCustomer,
    pickerOpen,
    setPickerOpen,
    submitError,
    isPending,
    reviewHeadingRef,
    previewBtnRef,
    register,
    control,
    handleSubmit,
    fields,
    remove,
    watchedItems,
    estimate,
    canSend,
    sendDisabledMsg,
    syntheticInvoice,
    handleAddFromSaved,
    handleAddItem,
    handleSaveDraft,
    onSubmit,
    onDiscard,
    onDelete,
  } = useInvoiceEditForm({
    draft,
    isoDate,
    businessGstEnabled,
    businessStateCode,
    businessDefaultGstRate,
  });

  if (view === "preview") {
    return (
      <InvoiceFormReviewView
        invoiceIdNoHash={draft.invoiceId}
        customerName={customer?.name ?? draft.customerName}
        phone={customer?.phone ?? draft.customerPhone}
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
        onDiscard={onDiscard}
        onSaveDraft={handleSaveDraft}
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
          onSelectCustomer={setCustomer}
          onClearCustomer={() => setCustomer(null)}
          fields={fields}
          register={register}
          control={control}
          onAddItem={handleAddItem}
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
              invoiceIdNoHash={draft.invoiceId}
              customerName={customer?.name ?? draft.customerName}
              phone={customer?.phone ?? draft.customerPhone}
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
              mode="edit"
              canSend={canSend}
              isPending={isPending}
              invoice={syntheticInvoice}
              onDiscard={onDiscard}
              onSaveDraft={handleSaveDraft}
              discardLabel="Discard changes"
              onDelete={onDelete}
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
        onDiscard={onDiscard}
        onSaveDraft={handleSaveDraft}
        onDelete={onDelete}
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
