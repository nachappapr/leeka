---
name: project-selected-day-white-on-coral
description: Selected calendar day: text-white on bg-primary (#f46a39) = 3.01:1; fails SC 1.4.3 for 12px text; same pair verified 3.01:1 multiple times; fix text-ink or use coral-press bg
metadata:
  type: project
---

`BrandDatePicker` passes `classNames={{ selected: "bg-primary text-white rounded-md" }}`. The CalendarDayButton also uses `data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground` = `#ffffff`. Text inside the day button is rendered at 12px (the `[&>span]:text-xs` from the primitive). 

**Contrast:** text-white (#ffffff) on bg-primary (#f46a39) = **3.01:1**. Fails SC 1.4.3 (needs 4.5:1 for 12px). The 3:1 threshold for large text requires ≥18.67px bold — 12px does not qualify.

**Why:** Coral-on-white is a repeatedly recurring failure in this project (3.01:1). The selected day is the primary visual indicator of the current selection and must be text-accessible, not just visually distinct.

**How to apply:** Either:
1. Change the bg to `bg-coral-press` (#d9531f) — white on coral-press = 4.03:1 still fails (needs 4.5); 
2. Use `text-ink` (#1f1a14) on `bg-primary`: 5.73:1 — PASSES, but loses the "white on color" aesthetic;
3. Use `bg-coral-ink` (#5a1e08) + `text-white`: white on coral-ink = very high contrast — PASSES but very dark;
4. Recommended: `bg-coral-soft text-coral-ink` — visually distinct, passes both thresholds.

Related: [[project-coral-on-white-contrast]], [[project-white-text-on-bg-coral]]
