// No "use client": purely presentational — all handlers passed in as props, no hooks owned.
// Rides the client boundary of the parent (InvoiceFormCustomerSearchCombobox).

import * as React from "react"

import { ChevronRight, Plus } from "@/components/icons"
import type { FilteredCustomer } from "@/lib/types/customer"
import { cn } from "@/lib/utils"

import { InvoiceFormCustomerAvatar } from "./invoice-form-customer-avatar"

export function InvoiceFormCustomerComboboxDropdown({
  query,
  matches,
  activeIndex,
  listboxRef,
  onSelect,
  onSetActive,
  onClearActive,
  onEnterAddNew,
}: {
  query: string
  matches: FilteredCustomer[]
  activeIndex: number
  listboxRef: React.RefObject<HTMLUListElement | null>
  onSelect: (i: number) => void
  onSetActive: (i: number) => void
  onClearActive: () => void
  onEnterAddNew: () => void
}) {
  const q = query.trim().toLowerCase()
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-90 overflow-y-auto rounded-2xl border-[1.5px] border-line bg-card p-1.5 shadow-float">
      {/* Section label — role="presentation" keeps it out of option count */}
      {matches.length > 0 && (
        <div
          role="presentation"
          className="px-2.5 pb-1 pt-2 text-kicker font-extrabold uppercase tracking-wide text-ink-3"
        >
          {q
            ? `${matches.length} match${matches.length === 1 ? "" : "es"}`
            : "Recent customers"}
        </div>
      )}

      {matches.length === 0 && (
        <p className="px-3 py-3.5 text-caption text-ink-2">
          No customer matches &ldquo;
          <strong className="text-ink">{query}</strong>
          &rdquo;.
        </p>
      )}

      {/* Listbox — keyboard managed via aria-activedescendant on the input
          (APG combobox pattern). tabIndex={-1} + onKeyDown let AT users who
          tab into the list also activate options. */}
      <ul
        ref={listboxRef}
        role="listbox"
        id="cp-listbox"
        aria-label="Saved customers"
        className="contents"
      >
        {matches.map((c, i) => (
          <li
            key={c.id}
            id={`cp-opt-${i}`}
            role="option"
            aria-selected={i === activeIndex}
            tabIndex={-1}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-lg p-2.5 text-left",
              i === activeIndex ? "bg-coral-soft" : "hover:bg-coral-soft",
            )}
            onMouseEnter={() => onSetActive(i)}
            onMouseLeave={onClearActive}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSelect(i)
              }
            }}
          >
            <InvoiceFormCustomerAvatar name={c.name} sizePx={32} />
            <div className="min-w-0 flex-1">
              <div className="text-body-sm font-bold text-ink">{c.name}</div>
              <div className="mt-px text-label text-ink-3">{c.phone}</div>
            </div>
            <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
          </li>
        ))}
      </ul>

      {/* Add-new footer — outside the listbox, not counted as an option */}
      <button
        type="button"
        className="mt-1 flex w-full items-center gap-3 rounded-b-lg border-t border-dashed border-line px-2.5 py-3 text-left text-caption text-ink-2 hover:bg-background"
        onClick={onEnterAddNew}
      >
        <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-coral-soft text-coral">
          <Plus className="size-4" strokeWidth={2.6} aria-hidden />
        </span>
        <span>
          <strong className="font-extrabold text-coral">Add new customer</strong>
          {q ? ` · use "${query}"` : " · name, phone, optional GSTIN"}
        </span>
      </button>
    </div>
  )
}
