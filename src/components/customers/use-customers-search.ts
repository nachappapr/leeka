"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionStartFunction,
} from "react";

import { fetchCustomersPage } from "@/app/(app)/customers/actions";
import type { CustomerPage, CustomerPageCursor } from "@/lib/types/customer";

const SEARCH_DEBOUNCE_MS = 300;

interface UseCustomersSearchArgs {
  startTransition: TransitionStartFunction;
  onClear: () => void;
  onSearchResult: (page: CustomerPage) => void;
  resyncKey: unknown;
}

interface UseCustomersSearchResult {
  searchInput: string;
  activeQuery: string | null;
  handleSearchInputChange: (value: string) => void;
  fetchWithActiveQuery: (cursor: CustomerPageCursor | null) => Promise<CustomerPage | null>;
}

export function useCustomersSearch({
  startTransition,
  onClear,
  onSearchResult,
  resyncKey,
}: UseCustomersSearchArgs): UseCustomersSearchResult {
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  const activeQueryRef = useRef<string | null>(null);
  const searchRequestIdRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A route resync (e.g. after a write elsewhere invalidates the cache tag)
  // hands the client an unfiltered server snapshot, so any active search is
  // stale and must fall back to browse mode. The state reset happens here,
  // synchronously during render (same "adjust state during render" pattern
  // the list-client uses for its own row/cursor reset), so the input never
  // flashes a stale value.
  //
  // The ref/timer invalidation can't run during render (ESLint's
  // react-hooks/refs rule forbids it, and mutating a ref mid-render is
  // impure besides), so it's deferred to an effect — but a plain useEffect
  // runs too late: it's scheduled for after paint, which is later than any
  // microtask, so an in-flight fetch's `.then()` (a microtask) that was
  // already queued when this resync committed would run BEFORE the effect
  // bumps the request id, passing the staleness check with a request id
  // that's technically already superseded. useLayoutEffect fires
  // synchronously inside the same commit as the render-phase reset above,
  // before the browser (or the JS engine) gets a chance to drain the
  // microtask queue, so no in-flight response can slip through the gap.
  const [committedResyncKey, setCommittedResyncKey] = useState(resyncKey);
  if (resyncKey !== committedResyncKey) {
    setCommittedResyncKey(resyncKey);
    setSearchInput("");
    setActiveQuery(null);
  }

  useLayoutEffect(() => {
    activeQueryRef.current = null;
    searchRequestIdRef.current += 1;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [resyncKey]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        const trimmed = value.trim();

        if (trimmed.length === 0) {
          if (activeQueryRef.current === null) return;
          searchRequestIdRef.current += 1;
          activeQueryRef.current = null;
          setActiveQuery(null);
          onClear();
          return;
        }

        if (trimmed === activeQueryRef.current) return;

        const requestId = ++searchRequestIdRef.current;
        activeQueryRef.current = trimmed;
        setActiveQuery(trimmed);
        startTransition(async () => {
          const result = await fetchCustomersPage(null, trimmed);
          if (searchRequestIdRef.current !== requestId) return;
          if (!result.ok) return;
          onSearchResult(result.page);
        });
      }, SEARCH_DEBOUNCE_MS);
    },
    [onClear, onSearchResult, startTransition],
  );

  const fetchWithActiveQuery = useCallback(async (cursor: CustomerPageCursor | null) => {
    const requestId = searchRequestIdRef.current;
    const queryAtDispatch = activeQueryRef.current;
    const result = await fetchCustomersPage(cursor, queryAtDispatch ?? undefined);
    // Unconditional: a browse-mode fetch (queryAtDispatch null) dispatched
    // just before the user starts a search is just as stale as a search
    // fetch superseded by a newer one — both must be discarded if the
    // request id moved on while this was in flight.
    if (searchRequestIdRef.current !== requestId) return null;
    if (!result.ok) return null;
    return result.page;
  }, []);

  return {
    searchInput,
    activeQuery,
    handleSearchInputChange,
    fetchWithActiveQuery,
  };
}
