---
name: data-list-row-label-contrast
description: DataListRow Status/Amount labels verified: text-label (12px) text-ink-3 on bg-card passes 4.5:1 at 5.92:1
metadata:
  type: project
---

DataListRow (`src/components/ui/custom/data-list-row.tsx`) changed "Status" / "Amount" row labels from `text-body-sm text-ink-2` (14px, #5b5042) to `text-label font-semibold text-ink-3` (12px, #6f6253) on `bg-card` (#ffffff).

**Contrast:** text-ink-3 (#6f6253) on bg-card (#ffffff) = **5.92:1** — PASSES SC 1.4.3 (needs 4.5:1 for normal text at 12px).

12px (`text-label`) is NOT large text (large = ≥24px or ≥18.67px bold). The 4.5:1 threshold applies. 5.92:1 clears it with margin.

**Why:** Both the colour change (ink-2 → ink-3) and size reduction (14px → 12px) were risk factors that needed explicit verification. The ink-3 token is strong enough on pure white (#ffffff) card backgrounds. Note: if these labels ever render on bg-surface-2 (#f5efe6), ratio drops to 5.18:1 — still passes.

**How to apply:** text-ink-3 is safe for small text (≥11px) on bg-card (#ffffff) at 5.92:1, on bg-background (#fbf6ef) at 5.50:1, and on bg-surface-2 (#f5efe6) at 5.18:1. All clear 4.5:1.
