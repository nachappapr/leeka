"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Search } from "@/components/icons";
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar";
import { StatusPill } from "@/components/ui/custom/status-pill";
import { searchAction } from "@/app/(app)/search/actions";
import { invoiceRowHref } from "@/lib/invoice/invoice-detail-href";
import { cn, initials } from "@/lib/utils";
import type { SearchInvoiceHit, SearchCustomerHit } from "@/lib/types/search";
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

export function SearchPalette() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [invoices, setInvoices] = useState<SearchInvoiceHit[]>([]);
  const [customers, setCustomers] = useState<SearchCustomerHit[]>([]);
  const [isPending, startTransition] = useTransition();
  const [queryKey, setQueryKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const clearResults = useCallback(() => {
    setInvoices([]);
    setCustomers([]);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    clearResults();
    inputRef.current?.blur();
  }, [clearResults]);

  // ⌘K / Ctrl+K opens; Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Click outside → close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

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
        setInvoices(results.invoices);
        setCustomers(results.customers);
        setCursor(0);
      });
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) clearResults();
  };

  const q = query.trim();

  const flat = [
    ...invoices.map((hit) => ({ kind: "invoice" as const, item: hit })),
    ...customers.map((hit) => ({ kind: "customer" as const, item: hit })),
  ];
  const showEmpty = !!q && !isPending && flat.length === 0;

  const choose = (entry: (typeof flat)[number]) => {
    if (entry.kind === "invoice") {
      router.push(invoiceRowHref(entry.item));
    } else {
      router.push("/customers");
    }
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && flat[cursor]) {
      e.preventDefault();
      choose(flat[cursor]);
    }
  };

  const announcement = (() => {
    if (!open) return "";
    if (isPending && q) return "Searching…";
    if (showEmpty) return `No results for "${query}"`;
    if (q && flat.length > 0) {
      const parts: string[] = [];
      if (invoices.length)
        parts.push(`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`);
      if (customers.length)
        parts.push(`${customers.length} customer${customers.length === 1 ? "" : "s"}`);
      return parts.length ? parts.join(" and ") + " found" : "";
    }
    return "";
  })();

  return (
    <div className="relative w-full max-w-xl" ref={boxRef}>
      <div key={queryKey} role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div
        className={cn(
          "flex h-10 items-center gap-2.5 rounded-full border bg-card px-3.5 transition-[border-color,box-shadow] duration-150",
          open ? "border-coral shadow-[0_0_0_4px_var(--color-coral-soft)]" : "border-border",
        )}
      >
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? "sp-results" : undefined}
          aria-activedescendant={open && flat.length > 0 ? `sp-opt-${cursor}` : undefined}
          aria-autocomplete="list"
          aria-label="Search invoices and customers"
          className={cn(
            "h-auto flex-1 bg-transparent py-0 text-body-sm text-ink outline-none placeholder:text-ink-3 transition-opacity duration-150",
            isPending && "opacity-60",
          )}
          placeholder="Search invoices, customers..."
          value={query}
          onChange={handleQueryChange}
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
          ) : flat.length > 0 ? (
            <>
              <div
                className={cn(
                  "max-h-115 overflow-y-auto scrollbar-none transition-opacity duration-150",
                  isPending && "opacity-50",
                )}
              >
                {invoices.length > 0 && (
                  <div role="group" aria-labelledby="sp-inv-lbl" className="py-2">
                    <div className="flex items-center justify-between px-4 pb-1.5 pt-2">
                      <span
                        id="sp-inv-lbl"
                        className="text-kicker font-black uppercase tracking-wider text-ink-3"
                      >
                        Invoices
                      </span>
                      <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-kicker font-black text-ink-3">
                        {invoices.length}
                      </span>
                    </div>
                    {invoices.map((inv, idx) => (
                      <div
                        key={inv.invoiceUuid}
                        id={`sp-opt-${idx}`}
                        role="option"
                        aria-selected={cursor === idx}
                        tabIndex={-1}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3.5 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                          cursor === idx
                            ? "bg-cream ring-1 ring-inset ring-coral-press"
                            : "hover:bg-cream",
                        )}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => choose({ kind: "invoice", item: inv })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            choose({ kind: "invoice", item: inv });
                          }
                        }}
                      >
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback className="bg-coral-soft text-label font-bold text-coral-ink">
                            {initials(inv.customerName ?? "")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-body-sm font-bold text-ink">
                            {inv.customerName}
                          </div>
                          <div className="mt-0.5 text-label text-ink-3">
                            {inv.id} · {inv.isoDate}
                          </div>
                        </div>
                        <span className="shrink-0 text-body-sm font-bold text-ink-2">
                          {inv.amount}
                        </span>
                        <StatusPill status={toStatusPillStatus(inv.status)} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
                {customers.length > 0 && (
                  <div
                    role="group"
                    aria-labelledby="sp-cust-lbl"
                    className={cn("py-2", invoices.length > 0 && "border-t border-border")}
                  >
                    <div className="flex items-center justify-between px-4 pb-1.5 pt-2">
                      <span
                        id="sp-cust-lbl"
                        className="text-kicker font-black uppercase tracking-wider text-ink-3"
                      >
                        Customers
                      </span>
                      <span className="rounded-full border border-border bg-cream px-2 py-0.5 text-kicker font-black text-ink-3">
                        {customers.length}
                      </span>
                    </div>
                    {customers.map((cust, idx) => {
                      const fi = invoices.length + idx;
                      return (
                        <div
                          key={cust.id}
                          id={`sp-opt-${fi}`}
                          role="option"
                          aria-selected={cursor === fi}
                          tabIndex={-1}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3.5 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-1",
                            cursor === fi
                              ? "bg-cream ring-1 ring-inset ring-coral-press"
                              : "hover:bg-cream",
                          )}
                          onMouseEnter={() => setCursor(fi)}
                          onClick={() => choose({ kind: "customer", item: cust })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              choose({ kind: "customer", item: cust });
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
                            <div className="mt-0.5 text-label text-ink-3">{cust.phone}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-4 border-t border-border bg-cream px-5 py-3">
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-kicker font-semibold text-ink-2">
                    ↑
                  </kbd>
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-kicker font-semibold text-ink-2">
                    ↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-kicker font-semibold text-ink-2">
                    ↵
                  </kbd>
                  open
                </span>
                <span className="flex items-center gap-1 text-label text-ink-3">
                  <kbd className="inline-block rounded border border-border bg-surface px-1 py-0.5 font-sans text-kicker font-semibold text-ink-2">
                    esc
                  </kbd>
                  close
                </span>
              </div>
            </>
          ) : q && isPending ? (
            <div className="px-6 py-6 text-center text-body-sm text-ink-3">Searching…</div>
          ) : !q ? (
            <div className="px-6 py-6 text-center text-body-sm text-ink-3">
              Type to search invoices and customers.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
