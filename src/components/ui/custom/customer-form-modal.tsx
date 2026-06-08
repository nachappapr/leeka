"use client"

// Shared add/edit customer modal — promoted to ui/custom/ as it's triggered from
// multiple surfaces (customers list, customer detail, invoice create).
import * as React from "react"
import { useRef, useState } from "react"
import { Check, Sparkles, XIcon } from "@/components/icons"
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal"
import { FieldLabel } from "@/components/ui/custom/field-label"
import { InputField } from "@/components/ui/custom/input-field"
import { PillButton } from "@/components/ui/custom/pill-button"
import { CustomerDeleteSheet } from "@/components/customers/customer-delete-sheet"
import type { Customer, CustomerSavePayload } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CustomerFormModalProps {
  mode: "add" | "edit"
  initial?: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (payload: CustomerSavePayload) => void
  onDelete?: (customer: Customer) => void
  finalFocusRef?: React.RefObject<HTMLElement | null>
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
  const isEdit = mode === "edit"

  // ── Form state ──────────────────────────────────────────────────────────
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [gstin, setGstin] = useState("")
  const [address, setAddress] = useState("")
  const [opening, setOpening] = useState("")
  const [prevOpen, setPrevOpen] = useState(open)

  const nameRef = useRef<HTMLInputElement>(null)

  // Render-phase state reset (same pattern as SendChannelsModal): when the
  // modal transitions closed → open, prefill (edit) or clear (add) without a
  // useEffect so no stale closure reads an old `initial`.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      if (isEdit && initial) {
        setName(initial.name ?? "")
        setPhone(initial.phone ?? "")
        setEmail(initial.email ?? "")
        setGstin(initial.gstin ?? "")
        setAddress(initial.address ?? "")
        setOpening("")
      } else {
        setName("")
        setPhone("")
        setEmail("")
        setGstin("")
        setAddress("")
        setOpening("")
      }
    }
  }

  const canSave = name.trim().length > 0 && phone.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return

    const payload: CustomerSavePayload = {
      ...(isEdit && initial ? { id: initial.id } : {}),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gstin: gstin.trim() || undefined,
      address: address.trim() || undefined,
    }
    if (!isEdit) {
      const raw = parseFloat(opening.replace(/[^\d.]/g, ""))
      payload.openingBalance = isNaN(raw) ? 0 : raw
    }

    onSave(payload)
    onOpenChange(false)
  }

  function handleDelete(customer: Customer) {
    onDelete?.(customer)
    onOpenChange(false)
  }

  // ── Header copy ─────────────────────────────────────────────────────────
  const eyebrow = isEdit ? "Edit customer" : "New customer"
  const title = isEdit ? `Edit ${initial?.name ?? "customer"}` : "Add a customer"
  const subtitle = isEdit
    ? "Update contact details. Changes apply to future invoices only."
    : "They'll appear in your saved list and can be billed instantly."
  const saveLabel = isEdit ? "Save changes" : "Save customer"

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        initialFocus={nameRef}
        finalFocus={finalFocusRef ?? undefined}
      >
        <form onSubmit={handleSubmit} className="contents">
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
            <div
              className={cn(
                "grid gap-3.5",
                "grid-cols-2 max-mobile:grid-cols-1",
              )}
            >
              {/* Business / customer name — required, full-width */}
              <div className="col-span-2 max-mobile:col-span-1">
                <FieldLabel htmlFor="cf-name">
                  Business / customer name
                </FieldLabel>
                <InputField
                  id="cf-name"
                  ref={nameRef}
                  required
                  autoComplete="organization"
                  placeholder="e.g. Sharma Sweets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Phone — required */}
              <div>
                <FieldLabel htmlFor="cf-phone">Phone number</FieldLabel>
                <InputField
                  id="cf-phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98XXX 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Email — optional */}
              <div>
                <FieldLabel htmlFor="cf-email">
                  Email{" "}
                  <span className="font-medium text-ink-3">(optional)</span>
                </FieldLabel>
                <InputField
                  id="cf-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* GSTIN — optional, auto-uppercase */}
              <div>
                <FieldLabel htmlFor="cf-gstin">
                  GSTIN{" "}
                  <span className="font-medium text-ink-3">(optional)</span>
                </FieldLabel>
                <InputField
                  id="cf-gstin"
                  placeholder="07AAACR1234A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                />
              </div>

              {/* Billing address — optional, full-width */}
              <div className="col-span-2 max-mobile:col-span-1">
                <FieldLabel htmlFor="cf-address">
                  Billing address{" "}
                  <span className="font-medium text-ink-3">(optional)</span>
                </FieldLabel>
                <InputField
                  id="cf-address"
                  autoComplete="street-address"
                  placeholder="Shop 14, Sector 8, Gurugram, Haryana 122001"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Opening balance — add mode only, full-width */}
              {!isEdit && (
                <div className="col-span-2 max-mobile:col-span-1">
                  <FieldLabel htmlFor="cf-opening">
                    Opening balance{" "}
                    <span className="font-medium text-ink-3">(optional)</span>
                  </FieldLabel>
                  <InputField
                    id="cf-opening"
                    inputMode="decimal"
                    placeholder="₹ 0"
                    value={opening}
                    onChange={(e) =>
                      setOpening(e.target.value.replace(/[^\d.]/g, ""))
                    }
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
                  You can edit any of these details later from the customer&apos;s
                  profile.
                </span>
              </div>
            )}
          </ModalBody>

          {/* ── Footer ── */}
          <ModalFooter className="items-center gap-2">
            {/* Desktop: destructive delete link (only in edit mode with onDelete) */}
            {isEdit && onDelete && initial && (
              <button
                type="button"
                onClick={() => handleDelete(initial)}
                className={cn(
                  "mr-auto hidden min-mobile:inline-flex items-center gap-1.5",
                  "text-caption text-overdue transition-colors hover:text-overdue-ink",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-overdue focus-visible:ring-offset-1",
                  "rounded-sm px-1.5 py-1",
                )}
              >
                Delete customer
              </button>
            )}

            {/* Mobile: MoreHorizontal → sheet (only in edit mode with onDelete) */}
            {isEdit && onDelete && initial && (
              <span className="mr-auto min-mobile:hidden">
                <CustomerDeleteSheet
                  customer={initial}
                  onDelete={handleDelete}
                />
              </span>
            )}

            {/* Cancel */}
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

            {/* Save */}
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
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
