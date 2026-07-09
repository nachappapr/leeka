"use client";

// Shared add/edit customer modal — promoted to ui/custom/ as it's triggered from
// multiple surfaces (customers list, customer detail, invoice create).
import * as React from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Check, Loader2, Sparkles, XIcon } from "@/components/icons";
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
import {
  CustomerFormDeleteButton,
  fireDeleteCustomerToast,
} from "@/components/customers/customer-form-delete-button";
import { CustomerDeleteSheet } from "@/components/customers/customer-delete-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerSchema, type CustomerFormData } from "@/lib/schema/customer";
import type { Customer, CustomerSavePayload } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerFormModalProps {
  mode: "add" | "edit";
  initial?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CustomerSavePayload) => Promise<{ ok: boolean; error?: string }>;
  onDelete?: (customer: Customer) => Promise<boolean>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;
}

interface FieldErrorProps {
  id: string;
  message: string | undefined;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-body-sm text-overdue">
      {message}
    </p>
  );
}

interface CustomerFormBodyProps {
  isEdit: boolean;
  initial?: Customer;
  nameRef: React.RefObject<HTMLInputElement | null>;
  deleteButtonRef: React.RefObject<HTMLButtonElement | null>;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: CustomerSavePayload) => Promise<{ ok: boolean; error?: string }>;
  onConfirmDelete: () => void;
  saveLabel: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}

function CustomerFormBody({
  isEdit,
  initial,
  nameRef,
  deleteButtonRef,
  onOpenChange,
  onSave,
  onConfirmDelete,
  saveLabel,
  eyebrow,
  title,
  subtitle,
}: CustomerFormBodyProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: standardSchemaResolver(CustomerSchema),
    mode: "onTouched",
    defaultValues: {
      name: initial?.name ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      gstin: initial?.gstin ?? "",
      billingAddress: initial?.address ?? "",
      openingBalance: undefined,
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(data: CustomerFormData) {
    setFormError(null);
    const payload: CustomerSavePayload = {
      ...(isEdit && initial ? { id: initial.id } : {}),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      gstin: data.gstin?.trim() || undefined,
      address: data.billingAddress?.trim() || undefined,
    };
    if (!isEdit) {
      payload.openingBalance = data.openingBalance ?? 0;
    }
    const result = await onSave(payload);
    if (result.ok) {
      onOpenChange(false);
    } else {
      setFormError(result.error ?? "Failed to save customer. Please try again.");
    }
  }

  // Merge RHF's ref with the external nameRef so ModalContent's initialFocus works.
  const { ref: rhfNameRef, ...nameFieldProps } = register("name");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="contents">
      {/* ── Header ── */}
      <ModalHeader>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Eyebrow pill */}
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

      {/* ── Body ── */}
      <ModalBody>
        {/* Two-column grid on desktop, single column on mobile */}
        <div className={cn("grid gap-3.5", "grid-cols-2 max-mobile:grid-cols-1")}>
          {/* Business / customer name — required, full-width */}
          <div className="col-span-2 max-mobile:col-span-1">
            <FieldLabel htmlFor="cf-name">Business / customer name</FieldLabel>
            <InputField
              id="cf-name"
              autoComplete="organization"
              placeholder="e.g. Sharma Sweets"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "cf-name-error" : undefined}
              {...nameFieldProps}
              ref={(el) => {
                rhfNameRef(el);
                nameRef.current = el;
              }}
            />
            <FieldError id="cf-name-error" message={errors.name?.message} />
          </div>

          {/* Phone — required */}
          <div>
            <FieldLabel htmlFor="cf-phone">Phone number</FieldLabel>
            <InputField
              id="cf-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98XXX 12345"
              aria-required="true"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "cf-phone-error" : undefined}
              {...register("phone")}
            />
            <FieldError id="cf-phone-error" message={errors.phone?.message} />
          </div>

          {/* Email — optional */}
          <div>
            <FieldLabel htmlFor="cf-email">
              Email <span className="font-medium text-ink-3">(optional)</span>
            </FieldLabel>
            <InputField
              id="cf-email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "cf-email-error" : undefined}
              {...register("email")}
            />
            <FieldError id="cf-email-error" message={errors.email?.message} />
          </div>

          {/* GSTIN — optional, auto-uppercase */}
          <div>
            <FieldLabel htmlFor="cf-gstin">
              GSTIN <span className="font-medium text-ink-3">(optional)</span>
            </FieldLabel>
            <InputField
              id="cf-gstin"
              placeholder="07AAACR1234A1Z5"
              aria-invalid={!!errors.gstin}
              aria-describedby={errors.gstin ? "cf-gstin-error" : undefined}
              {...register("gstin", {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  setValue("gstin", e.target.value.toUpperCase(), { shouldValidate: true });
                },
              })}
            />
            <FieldError id="cf-gstin-error" message={errors.gstin?.message} />
          </div>

          {/* Billing address — optional, full-width */}
          <div className="col-span-2 max-mobile:col-span-1">
            <FieldLabel htmlFor="cf-address">
              Billing address <span className="font-medium text-ink-3">(optional)</span>
            </FieldLabel>
            <InputField
              id="cf-address"
              autoComplete="street-address"
              placeholder="Shop 14, Sector 8, Gurugram, Haryana 122001"
              {...register("billingAddress")}
            />
          </div>

          {/* Opening balance — add mode only, full-width */}
          {!isEdit && (
            <div className="col-span-2 max-mobile:col-span-1">
              <FieldLabel htmlFor="cf-opening">
                Opening balance <span className="font-medium text-ink-3">(optional)</span>
              </FieldLabel>
              <InputField
                id="cf-opening"
                inputMode="decimal"
                placeholder="₹ 0"
                {...register("openingBalance", {
                  setValueAs: (v: string) => {
                    const raw = parseFloat(String(v).replace(/[^\d.]/g, ""));
                    return isNaN(raw) ? undefined : raw;
                  },
                })}
              />
            </div>
          )}
        </div>

        {/* Hint strip — add mode only */}
        {!isEdit && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-md px-3 py-2.5",
              "bg-coral-soft text-coral-ink",
            )}
          >
            <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span className="text-caption leading-relaxed">
              You can edit any of these details later from the customer&apos;s profile.
            </span>
          </div>
        )}
      </ModalBody>

      {/* ── Footer ──
        Order matches the design `.modal-foot`: Cancel · Save (flex-1) ·
        Delete on the right. */}
      <ModalFooter className="flex-col items-stretch gap-2">
        {formError && (
          <p role="alert" className="text-body-sm text-overdue">
            {formError}
          </p>
        )}

        <div className="flex items-center gap-2">
          <p role="status" aria-live="polite" className="sr-only">
            {isSubmitting ? "Saving…" : ""}
          </p>
          {/* Cancel */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className={cn(
              "h-11 rounded-lg border border-ink-3 bg-card px-4.5 text-body-sm font-bold text-ink",
              "transition-colors hover:bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              "inline-flex items-center justify-center gap-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <XIcon className="size-4" aria-hidden />
            <span className="sr-only min-mobile:not-sr-only">Cancel</span>
          </button>

          {/* Save */}
          <PillButton
            type="submit"
            tone="primary"
            size="md"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="rounded-lg flex-1 max-mobile:h-13"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            {saveLabel}
          </PillButton>

          {/* Delete (edit mode only) — sits on the right per the design */}
          {isEdit && initial && (
            <CustomerFormDeleteButton ref={deleteButtonRef} onDelete={onConfirmDelete} />
          )}
        </div>
      </ModalFooter>
    </form>
  );
}

export function CustomerFormModal({
  mode,
  initial,
  open,
  onOpenChange,
  onSave,
  onDelete,
  finalFocusRef,
}: CustomerFormModalProps) {
  const isEdit = mode === "edit";

  const nameRef = useRef<HTMLInputElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isMobile = useIsMobile();

  async function handleDelete(customer: Customer): Promise<boolean> {
    try {
      const ok = (await onDelete?.(customer)) ?? false;
      if (ok) {
        onOpenChange(false);
      }
      return ok;
    } catch {
      return false;
    }
  }

  // Mobile confirms in the nested bottom sheet; desktop mirrors the invoices
  // delete flow (persistent confirm toast). The modal must close before the
  // toast fires — its focus trap would keep keyboard users away from the
  // toast actions.
  function handleConfirmDelete() {
    if (!initial) return;
    if (isMobile) {
      setConfirmOpen(true);
      return;
    }
    onOpenChange(false);
    fireDeleteCustomerToast(initial, () => {
      void handleDelete(initial);
    });
  }

  const eyebrow = isEdit ? "Edit customer" : "New customer";
  const title = isEdit ? `Edit ${initial?.name ?? "customer"}` : "Add a customer";
  const subtitle = isEdit
    ? "Update contact details. Changes apply to future invoices only."
    : "They'll appear in your saved list and can be billed instantly.";
  const saveLabel = isEdit ? "Save changes" : "Save customer";

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent initialFocus={nameRef} finalFocus={finalFocusRef ?? undefined}>
        <CustomerFormBody
          key={isEdit ? (initial?.id ?? "edit") : "add"}
          isEdit={isEdit}
          initial={initial}
          nameRef={nameRef}
          deleteButtonRef={deleteButtonRef}
          onOpenChange={onOpenChange}
          onSave={onSave}
          onConfirmDelete={handleConfirmDelete}
          saveLabel={saveLabel}
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
        />

        {/* Rendered as a JSX descendant of Modal (not a sibling) so Base UI
            registers it as a nested dialog: Escape closes only the topmost
            sheet, and focus-restore ordering is owned by the dialog stack
            instead of racing two independent finalFocus calls. */}
        {isEdit && initial && (
          <CustomerDeleteSheet
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            customer={initial}
            finalFocusRef={deleteButtonRef}
            onDelete={handleDelete}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
