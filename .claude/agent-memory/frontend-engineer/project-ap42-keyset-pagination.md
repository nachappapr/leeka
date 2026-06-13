---
name: project-ap42-keyset-pagination
description: AP-42 keyset pagination — SC+client island pattern for invoice/customer lists, resolveBusinessId helper location, RPC row mapping
type: project
---

AP-42 (2026-06-13): Wired invoices + customers lists to live keyset RPC data.

**Architecture pattern established:**
- Server Component (container) fetches page 1 + ancillary data → passes as props to a Client Component island
- Client island holds: `invoices[]`, `cursor`, `hasMore`, `activeFilter` (invoices) in `useState`
- Load-more and filter changes call a "use server" action (`fetchInvoicesPage` / `fetchCustomersPage`) via `useTransition`
- No `useEffect` for data fetching — all data flows from SC initial render or server actions

**resolveBusinessId helper:**
- Lives in `src/lib/data/invoice.ts` (exported)
- Signature: `resolveBusinessId(supabase: SupabaseClient): Promise<string | null>`
- Reused by `src/lib/data/customer.ts` via import

**RPC row → Invoice mapping (`mapRpcRowToInvoice`):**
- `id = "#" + row.number` (keeps existing display/route format)
- `invoiceUuid = row.id` (the Postgres UUID, for WhatsApp modal)
- `amount = formatPaise(row.total)` (paise → ₹ string)
- `status` guarded via Set — defaults to "draft" if DB status not in StatusPillStatus

**Controlled filter in InvoiceListActionsProvider:**
- `desktopFilter` + `onDesktopFilterChange` are now required controlled props (was internal state)
- Dashboard passes `desktopFilter="all"` + `onDesktopFilterChange={() => {}}` (no filter UI on dashboard)

**Customer list:**
- `src/lib/data/customer.ts` — new file, server-only, `listCustomersPage` + `fetchCustomersFirstPage`
- `customers-table.tsx` — removed client-side pagination (PAGE_SIZE=5 prev/next) and `getPaginationRowModel`; kept column sort + global filter (scoped to loaded rows — DEVIATION)

**Load-more UI:** `InvoicesLoadMore` / `CustomersLoadMore` — `PillButton tone="outline" size="sm"`, renders only when `hasMore=true`

**DEVIATIONS noted:**
- Mobile sort (newest/oldest/amount/name) operates on loaded pages only — full-dataset client sort impossible with pagination
- Customer global search filters loaded rows only (server-side search is AP-41's lane)
- Mock `INVOICES` array kept in `src/lib/constants/invoices.ts` — still referenced by `INVOICE_DETAILS`, `findInvoiceDetail`, `export-invoices-modal.tsx` (default prop), `src/lib/constants/customers.ts`

**How to apply:**
- Use SC → client island pattern for any paginated list
- Always pass `resolveBusinessId` a `createClient()` result (not a fresh call inside the helper)
- "use server" pagination actions go in the feature's `src/app/(app)/<feature>/actions.ts`
