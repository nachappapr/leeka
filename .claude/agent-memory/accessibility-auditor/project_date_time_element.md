---
name: date-time-element
description: Invoice date strings are human-readable (e.g. "15 May 2026") rendered in a plain <span> — should be wrapped in <time datetime="YYYY-MM-DD"> for semantic correctness (SC 1.3.1)
metadata:
  type: project
---

`DataListRow` (`src/components/ui/custom/data-list-row.tsx:31`) renders `invoice.date` (e.g. "15 May 2026") in a bare `<span>`. The `<time>` element is the semantically correct wrapper for machine-readable dates; without it, AT and search engines cannot parse the date value.

**Fix:** wrap the date span as `<time dateTime="2026-05-15">{invoice.date}</time>`. The `dateTime` attribute must be a valid date string (YYYY-MM-DD). Since `invoice.date` is a human-readable string from the constants layer (not an ISO string), the implementer must either (a) parse it server-side to produce the ISO form, or (b) add a companion `isoDate` field to the `Invoice` type.

**Why:** SC 1.3.1 (Info and Relationships) requires that information conveyed through presentation be available in text. `<time>` with a `dateTime` attribute is the programmatic signal for date/time data.

**How to apply:** in any future audit where a date is rendered as plain text (not inside `<time>`), flag as Medium under SC 1.3.1. If the Invoice type does not carry an ISO date field, note the type-level change as part of the fix.

**Client boundary:** none — `<time>` is static HTML; the ISO string can be computed at render time in a Server Component.
