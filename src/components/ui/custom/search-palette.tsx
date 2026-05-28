"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Search } from "@/components/icons"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import { StatusPill } from "@/components/ui/custom/status-pill"
import { INVOICES } from "@/lib/constants/invoices"
import { CUSTOMERS } from "@/lib/constants/customers"
import { cn, initials } from "@/lib/utils"

export function SearchPalette() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ⌘K / Ctrl+K opens; Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Click outside → close
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const q = query.trim().toLowerCase()
  const normPhone = (s: string) => s.replace(/\D/g, "")
  const qPhone = normPhone(q)

  const invMatches = q
    ? INVOICES.filter(
        (i) =>
          i.customer.toLowerCase().includes(q) || i.id.toLowerCase().includes(q),
      ).slice(0, 3)
    : INVOICES.slice(0, 3)

  const custMatches = q
    ? CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (qPhone.length >= 3 && normPhone(c.phone).includes(qPhone)),
      ).slice(0, 3)
    : CUSTOMERS.slice(0, 3)

  const flat = [
    ...invMatches.map((i) => ({ kind: "invoice" as const, item: i })),
    ...custMatches.map((c) => ({ kind: "customer" as const, item: c })),
  ]
  const showEmpty = !!q && flat.length === 0

  const choose = (entry: (typeof flat)[number]) => {
    if (entry.kind === "invoice") {
      router.push(`/invoices/${encodeURIComponent(entry.item.id)}`)
    } else {
      router.push("/customers")
    }
    setQuery("")
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === "Enter" && flat[cursor]) {
      e.preventDefault()
      choose(flat[cursor])
    }
  }

  // Live announcement for screen readers
  const announcement = (() => {
    if (!open) return ""
    if (showEmpty) return `No results for "${query}"`
    if (q) {
      const parts: string[] = []
      if (invMatches.length) parts.push(`${invMatches.length} invoice${invMatches.length === 1 ? "" : "s"}`)
      if (custMatches.length) parts.push(`${custMatches.length} customer${custMatches.length === 1 ? "" : "s"}`)
      return parts.length ? parts.join(" and ") + " found" : ""
    }
    return ""
  })()

  return (
    <div className="relative w-full max-w-xl" ref={boxRef}>
      {/* Screen-reader live region for result count */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Input pill — combobox trigger */}
      <div
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-full border bg-card px-3.5 transition-[border-color,box-shadow] duration-150",
          open
            ? "border-coral shadow-[0_0_0_4px_var(--color-coral-soft)]"
            : "border-border",
        )}
      >
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? "sp-results" : undefined}
          aria-activedescendant={
            open && flat.length > 0 ? `sp-opt-${cursor}` : undefined
          }
          aria-autocomplete="list"
          aria-label="Search invoices and customers"
          className="h-auto flex-1 bg-transparent py-0 text-body-sm text-ink outline-none placeholder:text-ink-3"
          placeholder="Search invoices, customers..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCursor(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {!open && (
          <kbd className="shrink-0 rounded border border-border bg-cream px-1.5 py-0.5 font-sans text-label font-semibold text-ink-3">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown — overflow-hidden clips the scrollbar inside the border-radius */}
      {open && (
        <div
          id="sp-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-float"
        >
          {showEmpty ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto mb-2.5 flex size-11 items-center justify-center rounded-xl bg-cream text-ink-3">
                <Search className="size-5" aria-hidden />
              </div>
              <p className="text-body-sm font-bold text-ink">
                No matches for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-label text-ink-3">
                Try a customer name, phone, or invoice number.
              </p>
            </div>
          ) : (
            <>
              {/* Scrollable results */}
              <div className="max-h-115 overflow-y-auto scrollbar-none">
                {invMatches.length > 0 && (
                  <div
                    role="group"
                    aria-labelledby="sp-inv-lbl"
                    className="py-2"
                  >
                    <div className="flex items-center justify-between px-4 pb-1.5 pt-2">
                      <span
                        id="sp-inv-lbl"
                        className="text-11 font-black uppercase tracking-wider text-ink-3"
                      >
                        {q ? "Invoices" : "Recent invoices"}
                      </span>
                      <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-11 font-black text-ink-3">
                        {invMatches.length}
                      </span>
                    </div>
                    {invMatches.map((inv, idx) => (
                      <div
                        key={inv.id}
                        id={`sp-opt-${idx}`}
                        role="option"
                        aria-selected={cursor === idx}
                        tabIndex={-1}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3.5 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                          cursor === idx ? "bg-cream" : "hover:bg-cream",
                        )}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => choose({ kind: "invoice", item: inv })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            choose({ kind: "invoice", item: inv })
                          }
                        }}
                      >
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-coral-soft text-label font-bold text-coral-ink">
                            {initials(inv.customer)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body-sm font-bold text-ink">
                            {inv.customer}
                          </div>
                          <div className="mt-0.5 text-label text-ink-3">
                            {inv.id} · {inv.isoDate}
                          </div>
                        </div>
                        <span className="shrink-0 text-body-sm font-bold text-ink-2">
                          {inv.amount}
                        </span>
                        <StatusPill status={inv.status} />
                      </div>
                    ))}
                  </div>
                )}
                {custMatches.length > 0 && (
                  <div
                    role="group"
                    aria-labelledby="sp-cust-lbl"
                    className={cn(
                      "py-2",
                      invMatches.length > 0 && "border-t border-border",
                    )}
                  >
                    <div className="flex items-center justify-between px-4 pb-1.5 pt-2">
                      <span
                        id="sp-cust-lbl"
                        className="text-11 font-black uppercase tracking-wider text-ink-3"
                      >
                        {q ? "Customers" : "Top customers"}
                      </span>
                      <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-11 font-black text-ink-3">
                        {custMatches.length}
                      </span>
                    </div>
                    {custMatches.map((cust, idx) => {
                      const fi = invMatches.length + idx
                      return (
                        <div
                          key={cust.id}
                          id={`sp-opt-${fi}`}
                          role="option"
                          aria-selected={cursor === fi}
                          tabIndex={-1}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3.5 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                            cursor === fi ? "bg-cream" : "hover:bg-cream",
                          )}
                          onMouseEnter={() => setCursor(fi)}
                          onClick={() => choose({ kind: "customer", item: cust })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              choose({ kind: "customer", item: cust })
                            }
                          }}
                        >
                          <Avatar className="size-9 shrink-0">
                            <AvatarFallback className="bg-coral-soft text-label font-bold text-coral-ink">
                              {initials(cust.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-body-sm font-bold text-ink">
                              {cust.name}
                            </div>
                            <div className="mt-0.5 text-label text-ink-3">
                              {cust.phone}
                              {cust.invoiceCount
                                ? ` · ${cust.invoiceCount} invoice${cust.invoiceCount === 1 ? "" : "s"}`
                                : ""}
                            </div>
                          </div>
                          {cust.outstanding ? (
                            <span className="shrink-0 text-body-sm font-bold text-overdue-ink">
                              {cust.outstanding} due
                            </span>
                          ) : (
                            <span className="shrink-0 text-body-sm font-semibold text-ink-3">
                              All clear
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer — outside the scroll area */}
              <div className="flex shrink-0 items-center gap-4 border-t border-border bg-cream px-5 py-3">
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-10 font-semibold text-ink-2">↑</kbd>
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-10 font-semibold text-ink-2">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-10 font-semibold text-ink-2">↵</kbd>
                  open
                </span>
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-10 font-semibold text-ink-2">esc</kbd>
                  close
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
