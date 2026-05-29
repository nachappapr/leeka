---
name: desktop-live-region-split
description: When mobile and desktop show different data counts, a single role=status must announce the right count per breakpoint — or use two separate live regions.
metadata:
  type: project
---

When `InvoicesFilterShell` split into `filteredInvoices` (desktop, chip-driven) and `mobileInvoices` (mobile, sheet-driven), the single `<p role="status">` was updated to announce `mobileInvoices.length`. On desktop, chip filtering changes `filteredInvoices` but NOT `mobileInvoices`, so the announcement is stale/wrong for desktop screen-reader users.

**Why:** SC 4.1.3 requires status messages to accurately reflect the state the user perceives. If the announced count doesn't match the table a desktop user sees, it's misinformation.

**How to apply:** Whenever a component maintains separate `mobileX` and `desktopX` derived values for two layout branches, the live region must also branch — either two `<p role="status">` (one `min-mobile:sr-only` for desktop, one `max-mobile:sr-only` for mobile), or compute a single `activeCount` that resolves to the right value based on current viewport state. The simplest SSR-safe fix: two hidden `<p role="status">` elements each with the correct count and the appropriate breakpoint visibility class (`max-mobile:hidden` / `min-mobile:hidden`).
