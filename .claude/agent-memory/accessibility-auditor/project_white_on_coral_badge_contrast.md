---
name: white-on-coral-badge-contrast
description: text-white on bg-coral = 3.01:1 — fails SC 1.4.3 for normal text at any size below 18.67px bold; recurring pattern in count badges; fix is bg-coral-ink text-white (10.90:1)
type: project
---

`text-white` (#ffffff) on `bg-coral` (#f46a39) = 3.01:1. Fails the 4.5:1 requirement for normal text. Barely passes 3:1 for large text (≥18.67px bold / ≥24px regular) but count badges are always small (11–12px).

Recurring locations in Bahi:
- `action-sheet-row.tsx` count badge (12px/800)
- `status-toggle-chip.tsx` active count badge (11px/800, `text-kicker`)
- Any coral-background badge pattern

**Fix:** Use `bg-coral-ink text-white` → 10.90:1. Alternative: `bg-coral-press text-white` → 4.03:1 still fails at 11–12px. The only fully-passing fix at small sizes is the dark background.

**How to apply:** Any `text-white bg-coral` or `text-primary-foreground bg-primary` badge at sizes below 18.67px bold → immediate High contrast finding. Prescribe `bg-coral-ink text-white`.
