"use client"

import { useRef, useState } from "react"
import { Plus } from "@/components/icons"
import { PillButton } from "@/components/ui/custom/pill-button"
import { CustomerFormModal } from "@/components/ui/custom/customer-form-modal"
import type { CustomerSavePayload } from "@/lib/types"

interface CustomerAddTriggerProps {
  /** Optional callback — caller can update local/server state on save. */
  onSave?: (payload: CustomerSavePayload) => void
}

export function CustomerAddTrigger({ onSave }: CustomerAddTriggerProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function handleSave(payload: CustomerSavePayload) {
    // TODO: wire to backend — create customer via Server Action
    onSave?.(payload)
  }

  return (
    <>
      <PillButton
        ref={triggerRef}
        tone="primary"
        size="md"
        onClick={() => setOpen(true)}
        aria-label="Add customer"
      >
        <Plus aria-hidden />
        <span className="max-mobile:hidden">Add customer</span>
      </PillButton>

      <CustomerFormModal
        mode="add"
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        finalFocusRef={triggerRef}
      />
    </>
  )
}
