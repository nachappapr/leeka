---
name: customers-search-staleness-races
description: Two race conditions found in the server-side customer search staleness guard (use-customers-search.ts) — effect-deferred requestId invalidation and an unguarded browse-mode fetch path
type: project
---

Unit 2 of server-side customer search (`src/components/customers/use-customers-search.ts` +
`src/components/customers/customers-list-client.tsx`) had two races in the staleness-guard logic,
reported as High in the 2026-07-08 review:

1. **Render-phase reset vs. effect-deferred invalidation.** The resync-on-props-change branch
   resets `activeQuery`/`searchInput`/`searchResultCount` synchronously during render (the
   established "adjust state during render" pattern also used in `customers-list-client.tsx` for
   `serverRows`), but the actual request invalidation (`activeQueryRef.current = null`,
   `searchRequestIdRef.current += 1`) was deferred to a `useEffect(..., [resyncKey])`. Between the
   synchronous reset committing and the effect running (a macrotask later), an in-flight debounced
   search's promise (a microtask) can resolve, pass the stale-but-not-yet-incremented `requestId`
   check, and re-populate `customers` with just-cleared stale results.
2. **`fetchWithActiveQuery`'s guard only fires when `queryAtDispatch` is truthy.** A pagination/
   load-more request dispatched while browsing (query null) has no requestId guard at all, so if
   the user starts a search before that browse response resolves, the late response still appends
   its rows onto the (now-search) `customers` array unconditionally.

**Why:** these are exactly the two composed patterns the reviewer brief calls "the riskiest code in
the unit" — render-phase state adjustment + refs + effect interplay for async cache invalidation.
The fix in both cases is to make invalidation synchronous with the visible reset (do the ref/counter
writes in the render-phase branch, not the effect) and to make the guard unconditional (always
capture and compare a request id, not just when a query was active at dispatch time).

**How to apply:** when reviewing any future debounced-client-search + cache-tag-invalidation-resync
hook in this codebase, check specifically: (a) is request invalidation synchronous with the visible
state reset, not deferred to a `useEffect`; (b) does the staleness guard protect *every* async
dispatch path (browse pagination as well as search), not just the ones active at capture time. Don't
assume "monotonic requestId ref" alone is sufficient — trace exactly *when* the ref gets incremented
relative to when responses can arrive.

See also [[project-customers-pager-parity-clean]] (the sibling pagination unit these two files also
belong to, reviewed clean) and [[project-security-definer-use-cache-rpc-pattern]] (the RPC/cache
trust model `listCustomersPage`'s new `p_query` param follows).
