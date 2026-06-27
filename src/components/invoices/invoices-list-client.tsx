"use client";

import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { type PaginationState } from "@tanstack/react-table";

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

const PAGE_SIZE = 25;

interface InvoicesListClientProps {
  initialRows: ReadonlyArray<Invoice>;
  initialNextCursor: InvoicePageCursor | null;
  initialFilter: InvoiceStatusFilter;
  statusCounts: InvoiceStatusCounts;
  isProUser: boolean;
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
  const [rows, setRows] = useState<ReadonlyArray<Invoice>>(initialRows);
  const [cursor, setCursor] = useState<InvoicePageCursor | null>(initialNextCursor);
  const [hasMoreServer, setHasMoreServer] = useState(initialNextCursor !== null);
  const [activeFilter, setActiveFilter] = useState<InvoiceStatusFilter>(initialFilter);
  const [statusCounts, setStatusCounts] = useState<InvoiceStatusCounts>(initialStatusCounts);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const tableTopRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const prevHasMoreRef = useRef(initialNextCursor !== null);
  const loadMoreInFlightRef = useRef(false);

  // Resync from server props when the route re-renders with fresh data (e.g.
  // after creating an invoice + cache-tag invalidation). useState only reads
  // its initializer on mount, so without this the first page stays pinned to
  // the snapshot taken on first mount. initialRows only changes identity on a
  // server render — client-side filter/load-more mutate state without touching
  // it, so this never clobbers an in-progress filter or pagination. This is the
  // React "adjust state during render when a prop changes" pattern (no effect).
  const [serverRows, setServerRows] = useState(initialRows);

  if (initialRows !== serverRows) {
    setServerRows(initialRows);
    setRows(initialRows);
    setCursor(initialNextCursor);
    setHasMoreServer(initialNextCursor !== null);
    setActiveFilter(initialFilter);
    setStatusCounts(initialStatusCounts);
    setPageIndex(0);
  }

  const handleFilterChange = useCallback(
    (filter: InvoiceStatusFilter) => {
      if (filter === activeFilter) return;
      setActiveFilter(filter);
      setPageIndex(0);
      startTransition(async () => {
        const result = await fetchInvoicesPage(filter, null);
        if (!result.ok) return;
        setRows(result.page.rows);
        setCursor(result.page.nextCursor);
        setHasMoreServer(result.page.nextCursor !== null);
        setStatusCounts(result.counts);
      });
    },
    [activeFilter],
  );

  const handleLoadMore = useCallback(() => {
    if (!hasMoreServer || !cursor) return;
    loadMoreInFlightRef.current = true;
    startTransition(async () => {
      const result = await fetchInvoicesPage(activeFilter, cursor);
      if (!result.ok) return;
      setRows((prev) => [...prev, ...result.page.rows]);
      setCursor(result.page.nextCursor);
      setHasMoreServer(result.page.nextCursor !== null);
    });
  }, [hasMoreServer, cursor, activeFilter]);

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      const next =
        typeof updater === "function" ? updater({ pageIndex, pageSize: PAGE_SIZE }) : updater;
      const target = next.pageIndex;

      if (target <= pageIndex) {
        setPageIndex(target);
        tableTopRef.current?.focus();
      } else if (target * PAGE_SIZE < rows.length) {
        setPageIndex(target);
        tableTopRef.current?.focus();
      } else if (hasMoreServer) {
        tableTopRef.current?.focus();
        startTransition(async () => {
          const result = await fetchInvoicesPage(activeFilter, cursor);
          if (!result.ok) return;
          setRows((prev) => [...prev, ...result.page.rows]);
          setCursor(result.page.nextCursor);
          setHasMoreServer(result.page.nextCursor !== null);
          setPageIndex(target);
        });
      }
    },
    [pageIndex, rows.length, hasMoreServer, activeFilter, cursor],
  );

  useEffect(() => {
    const wasLoadInFlight = loadMoreInFlightRef.current;
    const prevHasMore = prevHasMoreRef.current;
    prevHasMoreRef.current = hasMoreServer;
    loadMoreInFlightRef.current = false;
    if (wasLoadInFlight && prevHasMore && !hasMoreServer) {
      listEndRef.current?.focus();
    }
  }, [hasMoreServer]);

  const desktopRows = rows.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const totalCount = statusCounts[activeFilter];
  const pageCount =
    typeof totalCount === "number"
      ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
      : Math.ceil(rows.length / PAGE_SIZE) + (hasMoreServer ? 1 : 0);

  const hasInvoices = rows.length > 0 || hasMoreServer;

  return (
    <InvoiceListActionsProvider
      invoices={rows}
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
                rows={rows}
                desktopPage={desktopRows}
                header={<InvoicesPageHeader />}
                statusCounts={statusCounts}
                hasMore={hasMoreServer}
                isLoading={isPending}
                onLoadMore={handleLoadMore}
                pageIndex={pageIndex}
                pageSize={PAGE_SIZE}
                pageCount={pageCount}
                total={totalCount}
                onPaginationChange={onPaginationChange}
                tableTopRef={tableTopRef}
              />
              <div
                ref={listEndRef}
                tabIndex={-1}
                className="sr-only"
                aria-label="End of loaded invoices"
              />
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
