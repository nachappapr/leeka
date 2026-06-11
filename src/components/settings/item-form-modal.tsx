"use client";

import * as React from "react";
import { useRef, useState } from "react";
import { Check, Trash2, XIcon } from "@/components/icons";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { FieldLabel } from "@/components/ui/custom/field-label";
import { InputField } from "@/components/ui/custom/input-field";
import { PillButton } from "@/components/ui/custom/pill-button";
import { BrandSelect } from "@/components/ui/custom/brand-select";
import type { SavedItem } from "@/lib/types/item";
import { cn } from "@/lib/utils";

const GST_RATE_OPTIONS = [
  { value: "0", label: "0%" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18%" },
  { value: "28", label: "28%" },
];

export interface ItemFormPayload {
  id?: string;
  name: string;
  hsnSac?: string;
  defaultPrice: number;
  defaultGstRate: number;
  unit?: string;
}

interface ItemFormModalProps {
  mode: "add" | "edit";
  initial?: SavedItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: ItemFormPayload) => void;
  onDelete?: (item: SavedItem) => void;
}

function blankFields() {
  return { name: "", hsnSac: "", price: "", gstRate: "18", unit: "" };
}

function fieldsFromItem(item: SavedItem) {
  return {
    name: item.name ?? "",
    hsnSac: item.hsn_sac ?? "",
    price: item.default_price != null ? String(item.default_price) : "",
    gstRate: item.default_gst_rate != null ? String(item.default_gst_rate) : "18",
    unit: item.unit ?? "",
  };
}

interface ItemFieldsProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  name: string;
  onName: (v: string) => void;
  hsnSac: string;
  onHsnSac: (v: string) => void;
  price: string;
  onPrice: (v: string) => void;
  gstRate: string;
  onGstRate: (v: string) => void;
  unit: string;
  onUnit: (v: string) => void;
}

function ItemFields({
  nameRef,
  name,
  onName,
  hsnSac,
  onHsnSac,
  price,
  onPrice,
  gstRate,
  onGstRate,
  unit,
  onUnit,
}: ItemFieldsProps) {
  return (
    <div className={cn("grid gap-3.5", "grid-cols-2 max-mobile:grid-cols-1")}>
      <div className="col-span-2 max-mobile:col-span-1">
        <FieldLabel htmlFor="if-name">Product or service name</FieldLabel>
        <InputField
          id="if-name"
          ref={nameRef}
          required
          placeholder="e.g. Web Design, Rice (5kg)"
          value={name}
          onChange={(e) => onName(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="if-hsn">
          HSN/SAC code <span className="font-medium text-ink-3">(optional)</span>
        </FieldLabel>
        <InputField
          id="if-hsn"
          placeholder="e.g. 998314"
          value={hsnSac}
          onChange={(e) => onHsnSac(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="if-unit">
          Unit <span className="font-medium text-ink-3">(optional)</span>
        </FieldLabel>
        <InputField
          id="if-unit"
          placeholder="e.g. pcs, kg, hrs"
          value={unit}
          onChange={(e) => onUnit(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="if-price">Default price (₹)</FieldLabel>
        <InputField
          id="if-price"
          required
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="0"
          value={price}
          onChange={(e) => onPrice(e.target.value)}
        />
      </div>
      <div>
        <FieldLabel htmlFor="if-gst">GST rate</FieldLabel>
        <BrandSelect
          ariaLabel="GST rate"
          value={gstRate}
          onValueChange={onGstRate}
          options={GST_RATE_OPTIONS}
        />
      </div>
    </div>
  );
}

export function ItemFormModal({
  mode,
  initial,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ItemFormModalProps) {
  const isEdit = mode === "edit";

  const [name, setName] = useState("");
  const [hsnSac, setHsnSac] = useState("");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [unit, setUnit] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  const nameRef = useRef<HTMLInputElement>(null);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const next = isEdit && initial ? fieldsFromItem(initial) : blankFields();
      setName(next.name);
      setHsnSac(next.hsnSac);
      setPrice(next.price);
      setGstRate(next.gstRate);
      setUnit(next.unit);
    }
  }

  const nameOk = name.trim().length > 0;
  const priceOk = price.trim().length > 0 && !isNaN(Number(price));
  const canSave = nameOk && priceOk;

  function buildPayload(): ItemFormPayload {
    return {
      ...(isEdit && initial ? { id: initial.id } : {}),
      name: name.trim(),
      hsnSac: hsnSac.trim() || undefined,
      defaultPrice: Number(price),
      defaultGstRate: Number(gstRate),
      unit: unit.trim() || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    onSave(buildPayload());
    onOpenChange(false);
  }

  function handleDelete() {
    if (initial) onDelete?.(initial);
    onOpenChange(false);
  }

  const eyebrow = isEdit ? "Edit item" : "New item";
  const title = isEdit ? `Edit ${initial?.name ?? "item"}` : "Add a saved item";
  const subtitle = isEdit
    ? "Update item details. Changes apply to future invoices only."
    : "Save products or services to prefill invoice lines quickly.";
  const saveLabel = isEdit ? "Save changes" : "Save item";

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent initialFocus={nameRef}>
          <form onSubmit={handleSubmit} className="contents">
            <ModalHeader>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "mb-2.5 inline-flex w-fit items-center rounded-full px-2.5 py-1",
                    "text-kicker font-black uppercase tracking-wider",
                    "bg-coral-soft text-coral-ink",
                  )}
                >
                  {eyebrow}
                </span>
                <ModalTitle>{title}</ModalTitle>
                <ModalDescription>{subtitle}</ModalDescription>
              </div>
              <ModalClose />
            </ModalHeader>

            <ModalBody>
              <ItemFields
                nameRef={nameRef}
                name={name}
                onName={setName}
                hsnSac={hsnSac}
                onHsnSac={setHsnSac}
                price={price}
                onPrice={setPrice}
                gstRate={gstRate}
                onGstRate={setGstRate}
                unit={unit}
                onUnit={setUnit}
              />
            </ModalBody>

            <ModalFooter className="items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "h-11 rounded-lg border border-ink-3 bg-card px-4.5 text-body-sm font-bold text-ink",
                  "transition-colors hover:bg-background",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                  "inline-flex items-center justify-center gap-2",
                )}
              >
                <XIcon className="size-4" aria-hidden />
                <span className="sr-only min-mobile:not-sr-only">Cancel</span>
              </button>

              <PillButton
                type="submit"
                tone="primary"
                size="md"
                disabled={!canSave}
                className="rounded-lg flex-1 max-mobile:h-13"
              >
                <Check className="size-4" aria-hidden />
                {saveLabel}
              </PillButton>

              {isEdit && initial && (
                <PillButton
                  type="button"
                  tone="outline"
                  size="md"
                  onClick={handleDelete}
                  aria-label="Delete item"
                  className={cn(
                    "rounded-lg border-overdue/30 bg-card text-overdue",
                    "hover:border-overdue/55 hover:bg-overdue-soft/40",
                    "focus-visible:ring-overdue",
                    "min-mobile:px-3.5",
                    "max-mobile:h-12 max-mobile:w-12 max-mobile:p-0",
                  )}
                >
                  <Trash2 className="size-4.5 shrink-0" aria-hidden />
                  <span className="ml-1.5 max-mobile:sr-only">Delete</span>
                </PillButton>
              )}
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
