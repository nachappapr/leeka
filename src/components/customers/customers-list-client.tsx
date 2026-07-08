"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { type PaginationState } from "@tanstack/react-table";

import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersMobileList } from "@/components/customers/customers-mobile-list";
import { CustomersLoadMore } from "@/components/customers/customers-load-more";
import { CustomersSearch } from "@/components/customers/customers-search";
import { useCustomersSearch } from "@/components/customers/use-customers-search";
import type { Customer } from "@/lib/types";
import type { CustomerPage, CustomerPageCursor } from "@/lib/types/customer";

const PAGE_SIZE = 25;

interface CustomersListClientProps {
  initialRows: ReadonlyArray<Customer>;
  initialNextCursor: CustomerPageCursor | null;
  totalCount?: number;
}

function isFocusInside(container: HTMLElement | null): boolean {
  return !!container && !!document.activeElement && container.contains(document.activeElement);
}

export function CustomersListClient({
  initialRows,
  initialNextCursor,
  totalCount,
}: CustomersListClientProps) {
  const [customers, setCustomers] = useState<ReadonlyArray<Customer>>(initialRows);
  const [cursor, setCursor] = useState<CustomerPageCursor | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialNextCursor !== null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const tableTopRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const prevHasMoreRef = useRef(initialNextCursor !== null);
  const loadMoreInFlightRef = useRef(false);
  const pendingSearchFocusRestoreRef = useRef(false);

  // Resync from server props when the route re-renders with fresh data (e.g.
  // after creating a customer + cache-tag invalidation). useState only reads
  // its initializer on mount, so without this the first page stays pinned to
  // the snapshot taken on first mount. initialRows only changes identity on a
  // server render — client-side load-more mutates state without touching it,
  // so this never clobbers an in-progress pagination. This is the React
  // "adjust state during render when a prop changes" pattern (no effect).
  const [serverRows, setServerRows] = useState(initialRows);

  if (initialRows !== serverRows) {
    setServerRows(initialRows);
    setCustomers(initialRows);
    setCursor(initialNextCursor);
    setHasMore(initialNextCursor !== null);
    setPageIndex(0);
  }

  const handleClearSearch = useCallback(() => {
    // Clearing/settling a search unmounts every DataRow/Link in the desktop
    // table body AND every card Link in the mobile list, swapping in a fresh
    // set. If keyboard focus was on one of those (and not, say, still in the
    // search input the user is typing in), it would otherwise silently drop
    // to <body> — capture that here, before the swap, and the effect below
    // restores it to tableTopRef afterwards (a valid, always-rendered target
    // on both breakpoints).
    pendingSearchFocusRestoreRef.current =
      isFocusInside(mobileListRef.current) || isFocusInside(tableBodyRef.current);
    setCustomers(serverRows);
    setCursor(initialNextCursor);
    setHasMore(initialNextCursor !== null);
    setPageIndex(0);
  }, [serverRows, initialNextCursor]);

  const handleSearchResult = useCallback((page: CustomerPage) => {
    pendingSearchFocusRestoreRef.current =
      isFocusInside(mobileListRef.current) || isFocusInside(tableBodyRef.current);
    setCustomers(page.rows);
    setCursor(page.nextCursor);
    setHasMore(page.nextCursor !== null);
    setPageIndex(0);
  }, []);

  const { searchInput, activeQuery, handleSearchInputChange, fetchWithActiveQuery } =
    useCustomersSearch({
      startTransition,
      onClear: handleClearSearch,
      onSearchResult: handleSearchResult,
      resyncKey: serverRows,
    });

  const handleLoadMore = useCallback(() => {
    if (!hasMore || !cursor) return;
    loadMoreInFlightRef.current = true;
    startTransition(async () => {
      const page = await fetchWithActiveQuery(cursor);
      if (!page) return;
      setCustomers((prev) => [...prev, ...page.rows]);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    });
  }, [hasMore, cursor, fetchWithActiveQuery]);

  const onPaginationChange = useCallback(
    (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      const next =
        typeof updater === "function" ? updater({ pageIndex, pageSize: PAGE_SIZE }) : updater;
      const target = next.pageIndex;

      if (target <= pageIndex) {
        setPageIndex(target);
        tableTopRef.current?.focus();
      } else if (target * PAGE_SIZE < customers.length) {
        setPageIndex(target);
        tableTopRef.current?.focus();
      } else if (hasMore) {
        tableTopRef.current?.focus();
        startTransition(async () => {
          const page = await fetchWithActiveQuery(cursor);
          if (!page) return;
          setCustomers((prev) => [...prev, ...page.rows]);
          setCursor(page.nextCursor);
          setHasMore(page.nextCursor !== null);
          setPageIndex(target);
        });
      }
    },
    [pageIndex, customers.length, hasMore, cursor, fetchWithActiveQuery],
  );

  useEffect(() => {
    const wasLoadInFlight = loadMoreInFlightRef.current;
    const prevHasMore = prevHasMoreRef.current;
    prevHasMoreRef.current = hasMore;
    loadMoreInFlightRef.current = false;
    if (wasLoadInFlight && prevHasMore && !hasMore) {
      listEndRef.current?.focus();
    }
  }, [hasMore]);

  useEffect(() => {
    if (pendingSearchFocusRestoreRef.current) {
      pendingSearchFocusRestoreRef.current = false;
      tableTopRef.current?.focus();
    }
  }, [customers]);

  const desktopRows = customers.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);
  const effectiveTotalCount = activeQuery ? undefined : totalCount;
  const pageCount =
    typeof effectiveTotalCount === "number"
      ? Math.max(1, Math.ceil(effectiveTotalCount / PAGE_SIZE))
      : Math.ceil(customers.length / PAGE_SIZE) + (hasMore ? 1 : 0);

  const from = pageIndex * PAGE_SIZE + 1;
  const to = pageIndex * PAGE_SIZE + desktopRows.length;

  // Search result/empty text is identical on both breakpoints (it's already
  // phrased off customers.length, not a page slice); only the browse-mode
  // text differs, since mobile never advances pageIndex — it keeps appending
  // via Load More instead of paging, so its range has to be phrased off the
  // full loaded count rather than the desktop from–to slice.
  const searchStatusText = activeQuery
    ? customers.length === 0
      ? `No customers match "${activeQuery}"`
      : `${customers.length} customer${customers.length === 1 ? "" : "s"} found for "${activeQuery}"`
    : null;

  const desktopStatusText =
    searchStatusText ??
    `Showing customers ${from}–${to}${typeof effectiveTotalCount === "number" ? ` of ${effectiveTotalCount}` : ""}`;

  const mobileStatusText =
    searchStatusText ??
    `Showing ${customers.length} customer${customers.length === 1 ? "" : "s"}${typeof effectiveTotalCount === "number" ? ` of ${effectiveTotalCount}` : ""}`;

  return (
    <>
      <div
        ref={tableTopRef}
        tabIndex={-1}
        className="sr-only"
        aria-label={`Customers, page ${pageIndex + 1}`}
      />
      <p role="status" className="sr-only max-mobile:hidden">
        {desktopStatusText}
      </p>
      <p role="status" className="sr-only min-mobile:hidden">
        {mobileStatusText}
      </p>
      <CustomersTable
        customers={desktopRows}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        pageCount={pageCount}
        total={effectiveTotalCount}
        isLoading={isPending}
        onPaginationChange={onPaginationChange}
        activeQuery={activeQuery}
        bodyRef={tableBodyRef}
        searchSlot={<CustomersSearch value={searchInput} onChange={handleSearchInputChange} />}
      />
      <div className="min-mobile:hidden">
        <div className="flex flex-col gap-3 p-4">
          <CustomersSearch value={searchInput} onChange={handleSearchInputChange} />
          <div ref={mobileListRef}>
            <CustomersMobileList
              customers={customers}
              activeQuery={activeQuery}
              isLoading={isPending}
            />
          </div>
        </div>
        <CustomersLoadMore hasMore={hasMore} isLoading={isPending} onLoadMore={handleLoadMore} />
      </div>
      <div
        ref={listEndRef}
        tabIndex={-1}
        className="sr-only"
        aria-label="End of loaded customers"
      />
    </>
  );
}
