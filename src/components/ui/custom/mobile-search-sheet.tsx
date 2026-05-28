"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { Search, XIcon, ChevronRight, Receipt, Users, Plus } from "@/components/icons"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import { StatusPill } from "@/components/ui/custom/status-pill"
import { INVOICES } from "@/lib/constants/invoices"
import { CUSTOMERS } from "@/lib/constants/customers"
import { JUMP_ITEMS } from "@/lib/constants/search"
import { cn, initials, loadRecentSearches, saveRecentSearches } from "@/lib/utils"
import type { RecentSearchEntry, SearchScope } from "@/lib/types/search"

interface MobileSearchSheetProps {
  open: boolean
  onClose: () => void
}

export function MobileSearchSheet({ open, onClose }: MobileSearchSheetProps) {
  const [query, setQuery] = useState("")
  const [scope, setScope] = useState<SearchScope>("all")
  const [recents, setRecents] = useState<RecentSearchEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    // Capture the element that opened the dialog so focus can be restored on close
    const prevFocus = document.activeElement as HTMLElement
    const t = setTimeout(() => {
      setQuery("")
      setScope("all")
      setRecents(loadRecentSearches())
      inputRef.current?.focus()
    }, 0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return }
      // Tab trap — keep focus inside the dialog
      if (e.key !== "Tab") return
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Search"]')
      if (!dialog) return
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      prevFocus?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const normPhone = (s: string) => s.replace(/\D/g, "")
  const qPhone = normPhone(q)

  const invMatches =
    q && scope !== "customers"
      ? INVOICES.filter(
          (i) =>
            i.customer.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q),
        )
      : []
  const custMatches =
    q && scope !== "invoices"
      ? CUSTOMERS.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (qPhone.length >= 3 && normPhone(c.phone).includes(qPhone)),
        )
      : []

  const noQuery = q.length === 0
  const noData = INVOICES.length === 0 && CUSTOMERS.length === 0

  const countBy = (status: string) => {
    if (status === "sent")
      return INVOICES.filter(
        (i) => i.status === "sent" || i.status === "viewed",
      ).length
    return INVOICES.filter((i) => i.status === status).length
  }

  const hasResults = invMatches.length > 0 || custMatches.length > 0

  // Live announcement for result count changes
  const liveAnnouncement = (() => {
    if (noQuery) return ""
    if (!hasResults) return `No results for "${query}"`
    const parts: string[] = []
    if (invMatches.length) parts.push(`${invMatches.length} invoice${invMatches.length === 1 ? "" : "s"}`)
    if (custMatches.length) parts.push(`${custMatches.length} customer${custMatches.length === 1 ? "" : "s"}`)
    return parts.join(" and ") + " found"
  })()

  const recordRecent = (entry: RecentSearchEntry) => {
    const next = [
      entry,
      ...recents.filter((r) => !(r.id === entry.id && r.type === entry.type)),
    ].slice(0, 5)
    setRecents(next)
    saveRecentSearches(next)
  }

  const openInvoice = (id: string, customer: string) => {
    recordRecent({ label: customer, type: "invoice", id })
    router.push(`/invoices/${encodeURIComponent(id)}`)
    onClose()
  }
  const openCustomer = (id: string, name: string) => {
    recordRecent({ label: name, type: "customer", id })
    router.push("/customers")
    onClose()
  }
  const openRecent = (r: RecentSearchEntry) => {
    if (r.type === "invoice") {
      router.push(`/invoices/${encodeURIComponent(r.id)}`)
    } else {
      router.push("/customers")
    }
    onClose()
  }
  const jumpFilter = (filter: string) => {
    router.push(`/invoices?filter=${filter}`)
    onClose()
  }
  const clearRecents = () => {
    setRecents([])
    saveRecentSearches([])
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex flex-col bg-cream animate-in fade-in slide-in-from-bottom-2 duration-150 motion-reduce:animate-none motion-reduce:transition-none"
    >
      {/* Screen-reader live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Search header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3.5">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-full border border-border bg-cream px-4 transition-[border-color,box-shadow] duration-150 focus-within:border-coral focus-within:shadow-[0_0_0_4px_var(--color-coral-soft)]">
          <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search invoices and customers"
            aria-expanded={hasResults}
            aria-haspopup="listbox"
            aria-controls={hasResults ? "ms-results" : undefined}
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-body font-medium text-ink outline-none placeholder:text-ink-3"
            placeholder="Search invoices, customers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-line text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
        {/* Cancel — coral-ink meets 4.5:1 on white; min-h-12 = 48px tap target */}
        <button
          className="min-h-12 shrink-0 px-2 py-3 text-body font-bold text-coral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

      {/* Scope chips — radiogroup semantics; h-12 = 48px tap target; border-ink-3 = 5.9:1 contrast */}
      {!noData && (
        <div
          role="radiogroup"
          aria-label="Filter results"
          className="flex gap-2.5 overflow-x-auto border-b border-border bg-surface px-4 py-3 scrollbar-none"
        >
          {(["all", "invoices", "customers"] as const).map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={scope === s}
              className={cn(
                "h-12 shrink-0 rounded-full border px-3.5 text-13 font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                scope === s
                  ? "border-ink bg-ink text-white"
                  : "border-ink-3 bg-surface text-ink",
              )}
              onClick={() => setScope(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-10">
        {noData ? (
          /* Empty state */
          <div className="flex flex-col items-center px-7 py-14 text-center">
            <div className="mb-3.5 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-ink-3">
              <Search className="size-6" aria-hidden />
            </div>
            <p className="text-title-sm font-black text-ink">Nothing to search yet</p>
            <p className="mt-1 text-body-sm text-ink-3">
              Create an invoice or add a customer — they&apos;ll show up here when you
              search.
            </p>
            <div className="mt-5 flex w-full gap-2">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-coral px-4 py-3 text-body-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                onClick={() => { onClose(); router.push("/invoices/new") }}
              >
                <Plus className="size-4" /> Create invoice
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-body-sm font-bold text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                onClick={() => { onClose(); router.push("/customers") }}
              >
                <Users className="size-4" /> Add customer
              </button>
            </div>
          </div>
        ) : noQuery ? (
          /* Idle state — recent searches + jump-to */
          <>
            {recents.length > 0 && (
              <div className="py-3.5">
                <div className="mb-2.5 flex items-center justify-between px-4.5">
                  <h2 className="text-11 font-black uppercase tracking-wider text-ink-3">
                    Recent
                  </h2>
                  {/* coral-ink on cream = 12:1 — passes 4.5:1 */}
                  <button
                    className="text-label font-bold text-coral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={clearRecents}
                  >
                    Clear
                  </button>
                </div>
                {recents.map((r, i) => (
                  <button
                    key={i}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={() => openRecent(r)}
                  >
                    {r.type === "invoice" ? (
                      <Receipt className="size-5 text-ink-3" aria-hidden />
                    ) : (
                      <Users className="size-5 text-ink-3" aria-hidden />
                    )}
                    <span className="flex-1 text-body font-semibold text-ink">
                      {r.label}
                    </span>
                    <ChevronRight className="size-5 text-ink-3" aria-hidden />
                  </button>
                ))}
              </div>
            )}

            {/* Jump-to */}
            <div className={cn("pt-3.5", recents.length > 0 && "border-t border-border")}>
              <div className="mb-2.5 px-4.5">
                <h2 className="text-11 font-black uppercase tracking-wider text-ink-3">
                  Jump to
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5">
                {JUMP_ITEMS.map((j) => {
                  const count = countBy(j.filter)
                  return (
                    <button
                      key={j.filter}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left active:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                      onClick={() => jumpFilter(j.filter)}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: j.color }}
                      />
                      <span className="min-w-0 flex-1">
                        <strong className="block text-body-sm font-bold text-ink">
                          {j.label}
                        </strong>
                        <small className="block text-label text-ink-3">
                          {j.sub(count)}
                        </small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : !hasResults ? (
          /* No results */
          <div className="flex flex-col items-center px-7 py-14 text-center">
            <div className="mb-3.5 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-ink-3">
              <Search className="size-6" aria-hidden />
            </div>
            <p className="text-title-sm font-black text-ink">
              No matches for &ldquo;{query}&rdquo;
            </p>
            <p className="mt-1 text-body-sm text-ink-3">
              Try a customer name, phone, or invoice number.
            </p>
          </div>
        ) : (
          /* Results — listbox container for combobox aria-controls */
          <div id="ms-results" role="listbox" aria-label="Search results">
            {invMatches.length > 0 && (
              <div role="group" aria-labelledby="ms-inv-lbl" className="py-3.5">
                <div className="mb-2.5 flex items-center justify-between px-4.5">
                  <span id="ms-inv-lbl" className="text-11 font-black uppercase tracking-wider text-ink-3">
                    Invoices
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-label font-bold text-ink-3">
                    {invMatches.length}
                  </span>
                </div>
                {invMatches.map((inv) => (
                  <button
                    key={inv.id}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left active:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={() => openInvoice(inv.id, inv.customer)}
                  >
                    <Avatar className="size-11 shrink-0">
                      <AvatarFallback className="bg-coral-soft text-13 font-extrabold text-coral-ink">
                        {initials(inv.customer)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-15 font-bold text-ink">
                        {inv.customer}
                      </div>
                      <div className="mt-1 text-13 text-ink-3">
                        {inv.id} · {inv.isoDate} ·{" "}
                        <span className="font-bold">{inv.amount}</span>
                      </div>
                    </div>
                    <StatusPill status={inv.status} className="self-start mt-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {custMatches.length > 0 && (
              <div
                role="group"
                aria-labelledby="ms-cust-lbl"
                className={cn("py-3.5", invMatches.length > 0 && "border-t border-border")}
              >
                <div className="mb-2.5 flex items-center justify-between px-4.5">
                  <span id="ms-cust-lbl" className="text-11 font-black uppercase tracking-wider text-ink-3">
                    Customers
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-label font-bold text-ink-3">
                    {custMatches.length}
                  </span>
                </div>
                {custMatches.map((cust) => (
                  <button
                    key={cust.id}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left active:bg-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={() => openCustomer(cust.id, cust.name)}
                  >
                    <Avatar className="size-11 shrink-0">
                      <AvatarFallback className="bg-coral-soft text-13 font-extrabold text-coral-ink">
                        {initials(cust.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="text-15 font-bold text-ink">{cust.name}</div>
                      <div className="mt-1 text-13 text-ink-3">
                        {cust.phone}
                        {cust.invoiceCount
                          ? ` · ${cust.invoiceCount} invoice${cust.invoiceCount === 1 ? "" : "s"}`
                          : ""}
                        {cust.outstanding && (
                          <span className="font-bold text-overdue-ink">
                            {" "}
                            · {cust.outstanding} due
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
