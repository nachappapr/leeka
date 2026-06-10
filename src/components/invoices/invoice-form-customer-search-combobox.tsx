"use client";

// Justified "use client": owns query/open/activeIndex/addNewMode/addNewPrefill
// state, outside-click document event listener effect, scroll-active-option
// effect, and multiple refs (boxRef, inputRef, listboxRef).

import * as React from "react";

import { Search, XIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/custom/icon-button";
import { CUSTOMERS } from "@/lib/constants/customers";
import type { FilteredCustomer, SelectedCustomer } from "@/lib/types/customer";
import { cn } from "@/lib/utils";

import { InvoiceFormCustomerAddNewPanel } from "./invoice-form-customer-add-new-panel";
import { InvoiceFormCustomerComboboxDropdown } from "./invoice-form-customer-combobox-dropdown";

// ── Private helper ─────────────────────────────────────────────────────────

function filterCustomers(q: string): FilteredCustomer[] {
  if (!q) return Array.from(CUSTOMERS.slice(0, 5));
  return CUSTOMERS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q),
  );
}

// ── Export ─────────────────────────────────────────────────────────────────

export function InvoiceFormCustomerSearchCombobox({
  onSelect,
}: {
  onSelect: (c: SelectedCustomer) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [addNewMode, setAddNewMode] = React.useState(false);
  const [addNewPrefill, setAddNewPrefill] = React.useState("");

  const boxRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxRef = React.useRef<HTMLUListElement>(null);

  const q = query.trim().toLowerCase();
  const matches = filterCustomers(q);

  // Outside-click closes dropdown
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Scroll active option into view
  React.useEffect(() => {
    if (activeIndex < 0 || !listboxRef.current) return;
    listboxRef.current
      .querySelector<HTMLElement>(`#cp-opt-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function selectOption(i: number) {
    const c = matches[i];
    if (!c) return;
    onSelect({ name: c.name, phone: c.phone });
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectOption(activeIndex);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  function returnToSearch() {
    setAddNewMode(false);
    setAddNewPrefill("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  if (addNewMode) {
    return (
      <InvoiceFormCustomerAddNewPanel
        initialName={addNewPrefill}
        onBack={returnToSearch}
        onSave={(c) => {
          onSelect(c);
          setAddNewMode(false);
        }}
      />
    );
  }

  return (
    <div
      ref={boxRef}
      className="relative"
      onBlur={(e) => {
        // Close when focus leaves the whole widget (e.g. Tab-out)
        if (!boxRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <div
        className={cn(
          "flex h-13 items-center gap-2.5 rounded-2xl border-[1.5px] border-line bg-card px-3.5 transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none",
          // Soft-coral focus treatment — matches the design and the app's other
          // inputs (coral border + coral-soft glow).
          "focus-within:border-coral focus-within:ring-4 focus-within:ring-coral-soft",
          open && "border-coral ring-4 ring-coral-soft",
        )}
      >
        <Search className="size-4.5 shrink-0 text-ink-3" aria-hidden />

        {/* Combobox input — WAI-ARIA APG 1.2 combobox/listbox pattern */}
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? "cp-listbox" : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `cp-opt-${activeIndex}` : undefined}
          aria-label="Search saved customers"
          placeholder="Search saved customers..."
          className="min-w-0 flex-1 border-0 bg-transparent text-body font-medium text-ink outline-none placeholder:font-medium placeholder:text-ink-3"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          type="text"
          autoComplete="off"
          spellCheck={false}
        />

        {query && (
          <IconButton
            size="sm"
            aria-label="Clear search"
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
          >
            <XIcon className="size-3.5" aria-hidden />
          </IconButton>
        )}
      </div>

      {open && (
        <InvoiceFormCustomerComboboxDropdown
          query={query}
          matches={matches}
          activeIndex={activeIndex}
          listboxRef={listboxRef}
          onSelect={selectOption}
          onSetActive={setActiveIndex}
          onClearActive={() => setActiveIndex(-1)}
          onEnterAddNew={() => {
            setAddNewPrefill(query);
            setAddNewMode(true);
          }}
        />
      )}
    </div>
  );
}
