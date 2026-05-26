---
name: filter-chips-radiogroup
description: FilterChips uses role=group + aria-pressed for single-select chips; correct pattern is role=radiogroup + role=radio + aria-checked + arrow-key nav (APG Radio Group)
metadata:
  type: project
---

FilterChips (`src/components/ui/custom/filter-chips.tsx`) uses `role="group"` + `aria-pressed` on each button. However, the component is always single-select — pressing one chip deactivates the previous one. This misrepresents the interaction to AT: `aria-pressed` signals an independent toggle (on/off), not mutual exclusivity.

**Why:** `aria-pressed` is for independently toggle-able buttons. When only one option can be active at a time (radio semantics), the correct ARIA is `role="radiogroup"` on the container and `role="radio"` + `aria-checked` on each item, with arrow-key navigation (Left/Right move focus, Tab exits, Space selects). Using the wrong role actively lies to screen reader users.

**How to apply:** When FilterChips is used in single-select mode (one-always-active, default="all"), flag as High SC 4.1.2 + APG Radio Group. Full fix: change container `role` to `"radiogroup"`, change button `role` to `"radio"`, `aria-checked` replaces `aria-pressed`, add `tabIndex` roving pattern (only the active radio in the tab sequence), and add `onKeyDown` for Left/Right/Home/End arrow navigation. This requires `'use client'` — FilterChips already has it, no boundary impact.

Note: if the component is extended for multi-select in the future, `role="group"` + `aria-pressed` would be correct. The fix depends on the mode. Currently all uses are single-select.
