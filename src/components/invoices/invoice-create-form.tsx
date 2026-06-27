"use client";

// Justified "use client": consumes useInvoiceCreateForm, which owns useForm,
// useFieldArray, useWatch, useState, useTransition, useRouter, and callbacks.

import { InvoiceCreateHeader } from "./invoice-create-header";
import { InvoiceFormBody } from "./invoice-form-body";
import { InvoiceFormDesktopActionBar } from "./invoice-form-desktop-action-bar";
import { InvoiceFormItemPicker } from "./invoice-form-item-picker";
import { InvoiceFormEditMobileBar } from "./invoice-form-edit-mobile-bar";
import { InvoiceFormPreviewSidebar } from "./invoice-form-preview-sidebar";
import { InvoiceFormReviewView } from "./invoice-form-review-view";
import { useInvoiceCreateForm } from "./use-invoice-create-form";

interface InvoiceCreateFormProps {
  isoDate: string;
  dueIsoDate: string;
  businessGstEnabled: boolean;
  businessStateCode: string | null;
  businessDefaultGstRate: number;
  accentColor: string;
  footerMessage: string;
}

export function InvoiceCreateForm({
  isoDate,
  dueIsoDate,
  businessGstEnabled,
  businessStateCode,
  businessDefaultGstRate,
  accentColor,
  footerMessage,
}: InvoiceCreateFormProps) {
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
    append,
    remove,
    emptyItem,
    watchedItems,
    estimate,
    canSend,
    sendDisabledMsg,
    syntheticInvoice,
    handleSaveDraft,
    onSubmit,
    handleAddFromSaved,
    onDiscard,
  } = useInvoiceCreateForm({
    isoDate,
    businessGstEnabled,
    businessStateCode,
    businessDefaultGstRate,
  });

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
        accentColor={accentColor}
        footerMessage={footerMessage}
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
      <InvoiceCreateHeader />
      <form aria-label="Create invoice" onSubmit={handleSubmit(onSubmit)}>
        <InvoiceFormBody
          customer={customer}
          onSelectCustomer={setCustomer}
          onClearCustomer={() => setCustomer(null)}
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
              accentColor={accentColor}
              footerMessage={footerMessage}
            />
          }
          actionBar={
            <InvoiceFormDesktopActionBar
              canSend={canSend}
              isPending={isPending}
              invoice={syntheticInvoice}
              onDiscard={onDiscard}
              onSaveDraft={handleSaveDraft}
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
