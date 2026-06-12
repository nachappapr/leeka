"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { Search, XIcon, ChevronRight, Receipt, Users } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { StatusPill } from "@/components/ui/custom/status-pill";
import { JUMP_ITEMS } from "@/lib/constants/search";
import { cn, initials, loadRecentSearches, saveRecentSearches } from "@/lib/utils";
import { searchAction } from "@/app/(app)/search/actions";
import type {
  RecentSearchEntry,
  SearchScope,
  SearchInvoiceHit,
  SearchCustomerHit,
} from "@/lib/types/search";
import type { StatusPillStatus } from "@/components/ui/custom/status-pill";

const VALID_STATUSES = new Set<StatusPillStatus>([
  "draft",
  "sent",
  "viewed",
  "partial",
  "pending",
  "overdue",
  "paid",
]);

function toStatusPillStatus(s: string): StatusPillStatus {
  return VALID_STATUSES.has(s as StatusPillStatus) ? (s as StatusPillStatus) : "draft";
}

const SCOPES = ["all", "invoices", "customers"] as const;

interface MobileSearchSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSearchSheet({ open, onClose }: MobileSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [cursor, setCursor] = useState(0);
  const [recents, setRecents] = useState<RecentSearchEntry[]>([]);
  const [invoiceHits, setInvoiceHits] = useState<SearchInvoiceHit[]>([]);
  const [customerHits, setCustomerHits] = useState<SearchCustomerHit[]>([]);
  const [isPending, startTransition] = useTransition();
  const [queryKey, setQueryKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scopeGroupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const clearResults = useCallback(() => {
    setInvoiceHits([]);
    setCustomerHits([]);
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) clearResults();
  };

  const handleClearQuery = () => {
    setQuery("");
    clearResults();
  };

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement;
    const t = setTimeout(() => {
      setQuery("");
      setScope("all");
      setCursor(0);
      clearResults();
      setRecents(loadRecentSearches());
      inputRef.current?.focus();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-label="Search"]');
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prevFocus?.focus();
    };
  }, [open, onClose, clearResults]);

  // Debounced live search — schedules an RPC call ~200ms after the last keystroke.
  // State updates live inside the async transition callback (never synchronously),
  // satisfying react-hooks/set-state-in-effect.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) return;

    debounceRef.current = setTimeout(() => {
      setQueryKey((k) => k + 1);
      startTransition(async () => {
        const results = await searchAction(trimmed);
        setInvoiceHits(results.invoices);
        setCustomerHits(results.customers);
        setCursor(0);
      });
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Render to document.body — the Topbar <header> uses backdrop-filter, which
  // establishes a containing block for fixed descendants, so an in-place
  // `fixed inset-0` would resolve to the header strip, not the viewport.
  // (open is always false during SSR, so this stays hydration-safe.)
  if (!open) return null;

  const q = query.trim();

  const invMatches = scope !== "customers" ? invoiceHits : [];
  const custMatches = scope !== "invoices" ? customerHits : [];

  const totalResults = invMatches.length + custMatches.length;
  const noQuery = q.length === 0;
  const hasResults = invMatches.length > 0 || custMatches.length > 0;

  const liveAnnouncement = (() => {
    if (noQuery) return "";
    if (isPending) return "Searching…";
    if (!hasResults) return `No results for "${query}"`;
    const parts: string[] = [];
    if (invMatches.length)
      parts.push(`${invMatches.length} invoice${invMatches.length === 1 ? "" : "s"}`);
    if (custMatches.length)
      parts.push(`${custMatches.length} customer${custMatches.length === 1 ? "" : "s"}`);
    return parts.join(" and ") + " found";
  })();

  const recordRecent = (entry: RecentSearchEntry) => {
    const next = [
      entry,
      ...recents.filter((r) => !(r.id === entry.id && r.type === entry.type)),
    ].slice(0, 5);
    setRecents(next);
    saveRecentSearches(next);
  };

  const openInvoice = (inv: SearchInvoiceHit) => {
    const navId = inv.number ?? inv.invoiceUuid;
    recordRecent({ label: inv.customerName ?? inv.id, type: "invoice", id: navId });
    router.push(`/invoices/${encodeURIComponent(navId)}`);
    onClose();
  };
  const openCustomer = (cust: SearchCustomerHit) => {
    recordRecent({ label: cust.name, type: "customer", id: cust.id });
    router.push("/customers");
    onClose();
  };
  const openRecent = (r: RecentSearchEntry) => {
    if (r.type === "invoice") {
      router.push(`/invoices/${encodeURIComponent(r.id)}`);
    } else {
      router.push("/customers");
    }
    onClose();
  };
  const jumpFilter = (filter: string) => {
    router.push(`/invoices?filter=${filter}`);
    onClose();
  };
  const clearRecents = () => {
    setRecents([]);
    saveRecentSearches([]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(totalResults - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && hasResults) {
      e.preventDefault();
      if (cursor < invMatches.length) {
        openInvoice(invMatches[cursor]);
      } else {
        const custIdx = cursor - invMatches.length;
        if (custMatches[custIdx]) openCustomer(custMatches[custIdx]);
      }
    }
  };

  const handleScopeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const chips = scopeGroupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    if (!chips) return;
    const arr = Array.from(chips);
    const currentIdx = arr.findIndex((el) => el === document.activeElement);
    if (currentIdx === -1) return;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = (currentIdx + 1) % arr.length;
      setScope(SCOPES[next]);
      arr[next].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (currentIdx - 1 + arr.length) % arr.length;
      setScope(SCOPES[prev]);
      arr[prev].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setScope(SCOPES[0]);
      arr[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setScope(SCOPES[SCOPES.length - 1]);
      arr[arr.length - 1].focus();
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex flex-col bg-cream animate-in fade-in slide-in-from-bottom-2 duration-150 motion-reduce:animate-none motion-reduce:transition-none"
    >
      <div key={queryKey} role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Search header */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
        <div className="flex h-11 flex-1 items-center gap-3 rounded-full border border-border bg-cream px-4 transition-[border-color,box-shadow] duration-150 focus-within:border-coral focus-within:shadow-[0_0_0_4px_var(--color-coral-soft)]">
          <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-label="Search invoices and customers"
            aria-expanded={true}
            aria-haspopup="listbox"
            aria-controls={hasResults ? "ms-results" : undefined}
            aria-autocomplete="list"
            aria-activedescendant={hasResults ? `ms-opt-${cursor}` : undefined}
            className={cn(
              "flex-1 bg-transparent text-body font-medium text-ink outline-none placeholder:text-ink-3 transition-opacity duration-150",
              isPending && "opacity-60",
            )}
            placeholder="Search invoices, customers..."
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleInputKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-line text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
              onClick={handleClearQuery}
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

      {/* Scope chips — radiogroup semantics; h-9 = 36px matches design chip height; border-ink-3 = 5.9:1 contrast */}
      <div
        ref={scopeGroupRef}
        role="radiogroup"
        aria-label="Filter results"
        tabIndex={-1}
        className="flex gap-2.5 overflow-x-auto border-b border-border bg-surface px-4 py-3 scrollbar-none"
        onKeyDown={handleScopeKeyDown}
      >
        {SCOPES.map((s) => (
          <button
            key={s}
            role="radio"
            aria-checked={scope === s}
            tabIndex={scope === s ? 0 : -1}
            className={cn(
              "h-9 shrink-0 rounded-full border-[1.5px] px-3.5 text-caption font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
              scope === s
                ? "border-transparent bg-ink text-white"
                : "border-ink-3 bg-surface text-ink",
            )}
            onClick={() => setScope(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-10">
        {noQuery ? (
          <>
            {recents.length > 0 && (
              <div className="py-3.5">
                <div className="mb-2.5 flex items-center justify-between px-4.5">
                  <h2 className="text-kicker font-black uppercase tracking-wider text-ink-3">
                    Recent
                  </h2>
                  {/* coral-ink on cream = 12:1 — passes 4.5:1 */}
                  <button
                    className="text-label font-bold text-coral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={clearRecents}
                    aria-label="Clear recent searches"
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
                    <span className="flex-1 text-body font-semibold text-ink">{r.label}</span>
                    <ChevronRight className="size-5 text-ink-3" aria-hidden />
                  </button>
                ))}
              </div>
            )}

            {/* Jump-to */}
            <div className={cn("pt-3.5", recents.length > 0 && "border-t border-border")}>
              <div className="mb-2.5 px-4.5">
                <h2 className="text-kicker font-black uppercase tracking-wider text-ink-3">
                  Jump to
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5">
                {JUMP_ITEMS.map((j) => (
                  <button
                    key={j.filter}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left active:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1"
                    onClick={() => jumpFilter(j.filter)}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: j.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <strong className="block text-body-sm font-bold text-ink">{j.label}</strong>
                      <small className="block text-label text-ink-3">{j.sub(0)}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : q && isPending && !hasResults ? (
          <div className="flex flex-col items-center px-7 py-14 text-center">
            <div className="mb-3.5 flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-ink-3">
              <Search className="size-6" aria-hidden />
            </div>
            <p className="text-title-sm font-black text-ink">Searching…</p>
          </div>
        ) : !hasResults && q ? (
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
          <div
            id="ms-results"
            role="listbox"
            aria-label="Search results"
            className={cn("transition-opacity duration-150", isPending && "opacity-50")}
          >
            {invMatches.length > 0 && (
              <div role="group" aria-labelledby="ms-inv-lbl" className="py-3.5">
                <div className="mb-2.5 flex items-center justify-between px-4.5">
                  <span
                    id="ms-inv-lbl"
                    className="text-kicker font-black uppercase tracking-wider text-ink-3"
                  >
                    Invoices
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-label font-bold text-ink-3">
                    {invMatches.length}
                  </span>
                </div>
                {invMatches.map((inv, idx) => (
                  <div
                    key={inv.invoiceUuid}
                    id={`ms-opt-${idx}`}
                    role="option"
                    aria-selected={cursor === idx}
                    tabIndex={-1}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                      cursor === idx
                        ? "bg-cream ring-1 ring-inset ring-coral-press"
                        : "active:bg-line",
                    )}
                    onClick={() => openInvoice(inv)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openInvoice(inv);
                      }
                    }}
                  >
                    <Avatar className="size-11 shrink-0">
                      <AvatarFallback className="bg-coral-soft text-caption font-extrabold text-coral-ink">
                        {initials(inv.customerName ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body font-bold text-ink">
                        {inv.customerName}
                      </div>
                      <div className="mt-1 text-caption text-ink-3">
                        {inv.id} · {inv.isoDate} · <span className="font-bold">{inv.amount}</span>
                      </div>
                    </div>
                    <StatusPill
                      status={toStatusPillStatus(inv.status)}
                      size="sm"
                      className="self-start mt-0.5 shrink-0"
                    />
                  </div>
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
                  <span
                    id="ms-cust-lbl"
                    className="text-kicker font-black uppercase tracking-wider text-ink-3"
                  >
                    Customers
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-label font-bold text-ink-3">
                    {custMatches.length}
                  </span>
                </div>
                {custMatches.map((cust, idx) => {
                  const fi = invMatches.length + idx;
                  return (
                    <div
                      key={cust.id}
                      id={`ms-opt-${fi}`}
                      role="option"
                      aria-selected={cursor === fi}
                      tabIndex={-1}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-4 px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                        cursor === fi
                          ? "bg-cream ring-1 ring-inset ring-coral-press"
                          : "active:bg-line",
                      )}
                      onClick={() => openCustomer(cust)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openCustomer(cust);
                        }
                      }}
                    >
                      <Avatar className="size-11 shrink-0">
                        <AvatarFallback className="bg-coral-soft text-caption font-extrabold text-coral-ink">
                          {initials(cust.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-body font-bold text-ink">{cust.name}</div>
                        <div className="mt-1 text-caption text-ink-3">{cust.phone}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
