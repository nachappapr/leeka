---
name: project-check-icon-coral-on-background
description: BrandSelect selected-option Check icon: text-primary (#f46a39) on bg-background = 2.80:1 and on bg-coral-soft = 2.54:1; both fail SC 1.4.11 (non-text 3:1); fix text-coral-press
metadata:
  type: project
---

In `src/components/ui/custom/brand-select.tsx` line 88, `Select.ItemIndicator` contains `<Check size={15} strokeWidth={2.6} className="text-primary" aria-hidden />`. The Check icon is the sole visual indicator that an option is selected (besides `aria-selected` which is non-visual).

**Contrast (SC 1.4.11 — non-text, 3:1):**
- text-primary (#f46a39) on bg-background (#fbf6ef) when unselected+highlighted: **2.80:1** — FAIL
- text-primary (#f46a39) on bg-coral-soft (#ffe7da) when selected+highlighted: **2.54:1** — FAIL

**Why:** The Check icon is aria-hidden but it IS the only graphical indicator of selection (aria-selected is conveyed to AT but not visible). The icon must meet 3:1 against its background per SC 1.4.11.

**How to apply:** Change `className="text-primary"` to `className="text-coral-press"` (#d9531f). Coral-press on bg-background = 3.75:1 (PASS); on bg-coral-soft = 3.40:1 (PASS).

Related: [[project-coral-on-coral-soft-contrast]]
