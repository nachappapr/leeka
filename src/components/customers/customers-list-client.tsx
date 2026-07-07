"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersMobileList } from "@/components/customers/customers-mobile-list";
import { CustomersLoadMore } from "@/components/customers/customers-load-more";
import { fetchCustomersPage } from "@/app/(app)/customers/actions";
import type { Customer } from "@/lib/types";
import type { CustomerPageCursor } from "@/lib/types/customer";

interface CustomersListClientProps {
  initialRows: ReadonlyArray<Customer>;
  initialNextCursor: CustomerPageCursor | null;
}

export function CustomersListClient({ initialRows, initialNextCursor }: CustomersListClientProps) {
  const [customers, setCustomers] = useState<ReadonlyArray<Customer>>(initialRows);
  const [cursor, setCursor] = useState<CustomerPageCursor | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialNextCursor !== null);
  const [isPending, startTransition] = useTransition();

  const listEndRef = useRef<HTMLDivElement>(null);
  const prevHasMoreRef = useRef(initialNextCursor !== null);
  const loadMoreInFlightRef = useRef(false);

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
  }

  const handleLoadMore = useCallback(() => {
    if (!hasMore || !cursor) return;
    loadMoreInFlightRef.current = true;
    startTransition(async () => {
      const result = await fetchCustomersPage(cursor);
      if (!result.ok) return;
      setCustomers((prev) => [...prev, ...result.page.rows]);
      setCursor(result.page.nextCursor);
      setHasMore(result.page.nextCursor !== null);
    });
  }, [hasMore, cursor]);

  useEffect(() => {
    const wasLoadInFlight = loadMoreInFlightRef.current;
    const prevHasMore = prevHasMoreRef.current;
    prevHasMoreRef.current = hasMore;
    loadMoreInFlightRef.current = false;
    if (wasLoadInFlight && prevHasMore && !hasMore) {
      listEndRef.current?.focus();
    }
  }, [hasMore]);

  return (
    <>
      <p role="status" className="sr-only max-mobile:hidden">
        Showing {customers.length} customer{customers.length === 1 ? "" : "s"}
      </p>
      <p role="status" className="sr-only min-mobile:hidden">
        Showing {customers.length} customer{customers.length === 1 ? "" : "s"}
      </p>
      <CustomersTable customers={customers} />
      <div className="p-4 min-mobile:hidden">
        <CustomersMobileList customers={customers} />
      </div>
      <CustomersLoadMore hasMore={hasMore} isLoading={isPending} onLoadMore={handleLoadMore} />
      <div ref={listEndRef} tabIndex={-1} className="sr-only" aria-hidden />
    </>
  );
}
