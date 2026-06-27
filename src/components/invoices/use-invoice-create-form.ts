"use client";

import { useState, useTransition, useLayoutEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { saveInvoiceDraft } from "@/app/(app)/invoices/actions";
import { DraftFormSchema, type DraftFormData } from "@/lib/schema/invoice";
import type { SelectedCustomer } from "@/lib/types/customer";
import type { Invoice, SaveDraftOutcome } from "@/lib/types";
import type { SavedItem } from "@/lib/types/item";
import { estimateDraftTotals, toDraftSavePayload } from "@/lib/invoice/draft-form";
import { hasTotalsMismatch } from "@/lib/invoice/reconcile-totals";
import { formatRupees } from "@/lib/utils";
import { useViewFocusSwap } from "@/hooks/use-view-focus-swap";

const BASE_EMPTY_ITEM = { name: "", hsn_sac: "", qty: 1, unit_price: 0, discount: 0 };

interface UseInvoiceCreateFormArgs {
  isoDate: string;
  businessGstEnabled: boolean;
  businessStateCode: string | null;
  businessDefaultGstRate: number;
}

export function useInvoiceCreateForm({
  isoDate,
  businessGstEnabled,
  businessStateCode,
  businessDefaultGstRate,
}: UseInvoiceCreateFormArgs) {
  const router = useRouter();
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [customer, setCustomer] = useState<SelectedCustomer | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draftId, setDraftId] = useState<string | null>(null);

  const { reviewHeadingRef, previewBtnRef } = useViewFocusSwap(view);

  const emptyItem = useMemo(
    () => ({ ...BASE_EMPTY_ITEM, gst_rate: businessDefaultGstRate }),
    [businessDefaultGstRate],
  );

  const form = useForm<DraftFormData>({
    resolver: standardSchemaResolver(DraftFormSchema),
    defaultValues: { items: [{ ...emptyItem }], notes: "" },
  });

  const { register, control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = useWatch({ control, name: "items" });

  useLayoutEffect(() => {
    return () => {
      reset({ items: [{ ...emptyItem }], notes: "" });
      setCustomer(null);
      setView("edit");
      setDraftId(null);
      setSubmitError(null);
      setPickerOpen(false);
    };
  }, [emptyItem, reset]);

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

  async function handleSaveDraft(): Promise<SaveDraftOutcome> {
    if (!customer) return { ok: false, error: "Pick a customer first" };
    const result = await saveInvoiceDraft(
      toDraftSavePayload(customer.id, form.getValues(), draftId ?? undefined),
    );
    if (result.ok) {
      setDraftId(result.data.invoiceId);
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }

  const onSubmit = (data: DraftFormData) => {
    if (!customer) {
      setSubmitError("Please select a customer before saving.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveInvoiceDraft(
        toDraftSavePayload(customer.id, data, draftId ?? undefined),
      );
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

  const syntheticInvoice: Invoice = {
    id: "draft",
    customer: customer?.name ?? "New customer",
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
    onDiscard: () => router.push("/invoices"),
  };
}
