---
name: table-double-label
description: Tables must use <caption> OR aria-label, never both; aria-label wins but suppresses caption and causes doubled announcements in some AT
type: project
---

`invoice-preview-card.tsx` had both `aria-label="Invoice line items"` on the `<table>` element and a `<caption className="sr-only">Invoice line items</caption>`. These produce the same accessible name string but via two competing mechanisms.

**Why:** When `aria-label` is present on a `<table>`, it becomes the accessible name and the `<caption>` is demoted. However some AT (JAWS, older NVDA) announce both, producing "Invoice line items, Invoice line items". Additionally `aria-label` on a table hides the `<caption>` from sighted users who zoom in (caption is part of the table rendering tree). The correct HTML pattern is `<caption>` alone — it is the semantic label for the table, visible to all users, and may be visually hidden with `sr-only` if needed.

**How to apply:** For all tables in Lekka, use `<caption className="sr-only">` as the sole accessible name mechanism. Remove any `aria-label` on the `<table>` element. This pattern is pure static HTML, no client boundary cost.
