---
name: accent-radiogroup-missing-contract
description: AccentSwatch radiogroup in template-form.tsx lacks roving tabIndex and arrow-key nav — all established radiogroups in project implement the full APG contract; this is a Critical
metadata:
  type: project
---

AccentSwatch buttons have `role="radio"` inside `role="radiogroup"` but NO roving tabIndex and NO `onKeyDown` arrow-key handler (unlike `reminder-settings-panel.tsx`, `filter-chips.tsx`, `channel-chips.tsx` which all implement the full APG Radio Group contract). All 6 swatches default to `tabIndex=0`, putting them all in the tab stop sequence simultaneously.

**Why:** APG Radio Group requires: only selected radio in tab stop (tabIndex=0), others tabIndex=-1; ArrowRight/Down moves forward; ArrowLeft/Up moves backward; Home/End jump to first/last. Without this, keyboard users must tab through all 6 swatches individually and have no way to navigate with arrow keys as AT users expect.

**How to apply:** Flag as Critical (not merely "same as Epic 12 precedent") — all existing project radiogroups implement the contract. Fix: add `tabIndex={selected ? 0 : -1}` to AccentSwatch, add `onKeyDown` handler on the radiogroup `<div>` that queries `[role="radio"]`, computes next/prev index, focuses and selects the target swatch. Already a Client Component — no boundary cost.
