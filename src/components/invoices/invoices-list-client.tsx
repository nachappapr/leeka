"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { Card } from "@/components/ui/custom/card";
import { EmptyTableState } from "@/components/ui/custom/empty-table-state";
import { MobileTabBar } from "@/components/ui/custom/mobile-tab-bar";
import { Topbar } from "@/components/ui/custom/topbar";
import { InvoiceListActionsProvider } from "@/components/invoices/invoice-list-actions-provider";
import { InvoiceListActionsTrigger } from "@/components/invoices/invoice-list-actions-trigger";
import { InvoicesFilterShell } from "@/components/invoices/invoices-filter-shell";
import { InvoicesPageHeader } from "@/components/invoices/invoices-page-header";
import { fetchInvoicesPage } from "@/app/(app)/invoices/actions";
import type { Invoice, InvoiceStatusFilter } from "@/lib/types";
import type { InvoicePageCursor, InvoiceStatusCounts } from "@/lib/types/invoice";

interface InvoicesListClientProps {
  initialRows: ReadonlyArray<Invoice>;
  initialNextCursor: InvoicePageCursor | null;
  initialFilter: InvoiceStatusFilter;
  statusCounts: InvoiceStatusCounts;
  isProUser: boolean;
  /** Server-rendered notifications bell — passed through because it's an async Server Component. */
  notificationsSlot: ReactNode;
}

export function InvoicesListClient({
  initialRows,
  initialNextCursor,
  initialFilter,
  statusCounts: initialStatusCounts,
  isProUser,
  notificationsSlot,
}: InvoicesListClientProps) {
  const [invoices, setInvoices] = useState<ReadonlyArray<Invoice>>(initialRows);
  const [cursor, setCursor] = useState<InvoicePageCursor | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialNextCursor !== null);
  const [activeFilter, setActiveFilter] = useState<InvoiceStatusFilter>(initialFilter);
  const [statusCounts, setStatusCounts] = useState<InvoiceStatusCounts>(initialStatusCounts);
  const [isPending, startTransition] = useTransition();

  const listEndRef = useRef<HTMLDivElement>(null);
  const prevHasMoreRef = useRef(initialNextCursor !== null);
  const loadMoreInFlightRef = useRef(false);

  const handleFilterChange = useCallback(
    (filter: InvoiceStatusFilter) => {
      if (filter === activeFilter) return;
      setActiveFilter(filter);
      startTransition(async () => {
        const result = await fetchInvoicesPage(filter, null);
        if (!result.ok) return;
        setInvoices(result.page.rows);
        setCursor(result.page.nextCursor);
        setHasMore(result.page.nextCursor !== null);
        setStatusCounts(result.counts);
      });
    },
    [activeFilter],
  );

  const handleLoadMore = useCallback(() => {
    if (!hasMore || !cursor) return;
    loadMoreInFlightRef.current = true;
    startTransition(async () => {
      const result = await fetchInvoicesPage(activeFilter, cursor);
      if (!result.ok) return;
      setInvoices((prev) => [...prev, ...result.page.rows]);
      setCursor(result.page.nextCursor);
      setHasMore(result.page.nextCursor !== null);
    });
  }, [hasMore, cursor, activeFilter]);

  useEffect(() => {
    const wasLoadInFlight = loadMoreInFlightRef.current;
    const prevHasMore = prevHasMoreRef.current;
    prevHasMoreRef.current = hasMore;
    loadMoreInFlightRef.current = false;
    if (wasLoadInFlight && prevHasMore && !hasMore) {
      listEndRef.current?.focus();
    }
  }, [hasMore]);

  const hasInvoices = invoices.length > 0 || hasMore;

  return (
    <InvoiceListActionsProvider
      invoices={invoices}
      desktopFilter={activeFilter}
      onDesktopFilterChange={handleFilterChange}
      isProUser={isProUser}
    >
      <div className="flex flex-1 flex-col">
        <Topbar
          title="Invoices"
          subtitle="All your invoices"
          actions={<InvoiceListActionsTrigger />}
          notificationsSlot={notificationsSlot}
        />
        <div className="flex flex-1 flex-col gap-5 p-7 max-mobile:gap-3.5 max-mobile:p-4 max-mobile:pb-24">
          {hasInvoices ? (
            <>
              <InvoicesFilterShell
                invoices={invoices}
                header={<InvoicesPageHeader />}
                statusCounts={statusCounts}
                hasMore={hasMore}
                isLoading={isPending}
                onLoadMore={handleLoadMore}
              />
              <div ref={listEndRef} tabIndex={-1} className="sr-only" aria-hidden />
            </>
          ) : (
            <>
              <InvoicesPageHeader />
              <Card>
                <EmptyTableState
                  icon="Receipt"
                  title="No invoices yet"
                  body="Create your first invoice and we'll keep track of who's paid, who's viewed, and who needs a nudge."
                  primary={{ label: "Create invoice", href: "/invoices/new", icon: "Plus" }}
                />
              </Card>
            </>
          )}
        </div>
        <MobileTabBar />
      </div>
    </InvoiceListActionsProvider>
  );
}
