---
name: filter-chips-live-region
description: FilterChips result-set update is completely silent; no aria-live region announces how many invoices match the selected filter; SC 4.1.3 High
metadata:
  type: project
---

When a filter chip is toggled, `aria-pressed` state updates (SR hears the chip state change) but the filtered result count and list content change silently. No `aria-live` region exists anywhere in the invoices surface.

**Why:** SC 4.1.3 requires status messages (including result counts) to be programmatically determinable via role/property without moving focus. A screen reader user has no way to know how many invoices are now showing.

**How to apply:** Add a visually-hidden `role="status"` (or `aria-live="polite"`) element inside `InvoicesFilterShell`. Populate it with a string like `"Showing {count} invoice{s}"` whenever `filteredInvoices.length` changes. This is a state-driven DOM update — requires `InvoicesFilterShell` to be a Client Component (it already is `'use client'`), so no CLIENT-BOUNDARY conversion cost.

Example pattern:
```tsx
<p role="status" className="sr-only">
  Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
</p>
```

This element should be placed outside the Card so its content update doesn't interleave with table-reading. Place it immediately after the FilterChips.

Related: [[filter-chips-border-contrast]], [[unread-count-live-region-missing]]
