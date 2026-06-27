"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { saveInvoiceDraft } from "@/app/(app)/invoices/actions";
import { DraftFormSchema, type DraftFormData } from "@/lib/schema/invoice";
import type { SelectedCustomer } from "@/lib/types/customer";
import type { Invoice, SaveDraftOutcome } from "@/lib/types";
import type { SavedItem } from "@/lib/types/item";
import type { DraftInvoiceData } from "@/lib/data/invoice";
import { estimateDraftTotals, toDraftSavePayload } from "@/lib/invoice/draft-form";
import { hasTotalsMismatch } from "@/lib/invoice/reconcile-totals";
import { formatRupees } from "@/lib/utils";
import { useViewFocusSwap } from "@/hooks/use-view-focus-swap";

import { fireDeleteInvoiceToast } from "./invoice-form-delete-button";

function draftItemsToFormValues(items: DraftInvoiceData["items"]) {
  return items.map((it) => ({
    name: it.name,
    hsn_sac: it.hsn_sac ?? "",
    qty: it.qty,
    unit_price: it.unit_price,
    discount: it.discount,
    gst_rate: it.gst_rate,
  }));
}

interface UseInvoiceEditFormArgs {
  draft: DraftInvoiceData;
  isoDate: string;
  businessGstEnabled: boolean;
  businessStateCode: string | null;
  businessDefaultGstRate: number;
}

export function useInvoiceEditForm({
  draft,
  isoDate,
  businessGstEnabled,
  businessStateCode,
  businessDefaultGstRate,
}: UseInvoiceEditFormArgs) {
  const router = useRouter();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [customer, setCustomer] = useState<SelectedCustomer | null>({
    id: draft.customerId,
    name: draft.customerName,
    phone: draft.customerPhone,
    state_code: draft.customerStateCode,
  });

  const { reviewHeadingRef, previewBtnRef } = useViewFocusSwap(view);

  const form = useForm<DraftFormData>({
    resolver: standardSchemaResolver(DraftFormSchema),
    defaultValues: {
      items: draftItemsToFormValues(draft.items),
      notes: draft.notes ?? "",
    },
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

  function handleAddItem() {
    append({
      name: "",
      hsn_sac: "",
      qty: 1,
      unit_price: 0,
      discount: 0,
      gst_rate: businessDefaultGstRate,
    });
  }

  async function handleSaveDraft(): Promise<SaveDraftOutcome> {
    if (!customer) return { ok: false, error: "Pick a customer first" };
    const result = await saveInvoiceDraft(
      toDraftSavePayload(customer.id, form.getValues(), draft.invoiceId),
    );
    if (result.ok) return { ok: true };
    return { ok: false, error: result.error };
  }

  const onSubmit = (data: DraftFormData) => {
    if (!customer) {
      setSubmitError("Please select a customer before saving.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveInvoiceDraft(toDraftSavePayload(customer.id, data, draft.invoiceId));
      if (result.ok) {
        if (hasTotalsMismatch(estimate, result.data)) {
          setSubmitError("Saved totals did not match the preview. Please review and try again.");
          return;
        }
        router.push(`/invoices/${draft.invoiceId}`);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  const syntheticInvoice: Invoice = {
    id: draft.invoiceId,
    customer: customer?.name ?? draft.customerName,
    city: "",
    isoDate,
    amount: formatRupees(estimate.total / 100),
    status: "draft",
  };

  return {
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
    onDiscard: () => router.push(`/invoices/${draft.invoiceId}`),
    onDelete: () => fireDeleteInvoiceToast(draft.invoiceId, () => router.push("/invoices")),
  };
}
