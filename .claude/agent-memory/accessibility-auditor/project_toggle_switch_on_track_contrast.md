---
name: toggle-switch-on-track-contrast
description: ToggleSwitch ON-state bg-coral track fails SC 1.4.11 in two ways — white thumb at 2.89:1, track vs page at 2.69:1; fix is bg-coral-press on checked branch
metadata:
  type: project
---

ToggleSwitch (`src/components/ui/custom/toggle-switch.tsx`) uses `bg-coral` (#f46a39) for the ON-state track.

**Why this fails SC 1.4.11 (two counts):**
1. White thumb (#ffffff) on coral track (#f46a39) = 2.89:1 — below the 3:1 non-text UI component minimum.
2. Coral track (#f46a39) against page background (#fbf6ef) = 2.69:1 — below the 3:1 control boundary minimum.

The OFF-state track uses `bg-ink-3` (#6f6253) = 5.62:1 against both white card and cream background — that passes.

**Fix:** In the checked branch of the `cn()` call at line 42, swap `bg-coral` → `bg-coral-press` (#d9531f):
- White thumb on `#d9531f` = 4.03:1 ✓
- `#d9531f` on page bg (#fbf6ef) = 3.75:1 ✓

Static CSS token swap; toggle-switch.tsx is already `"use client"`. No boundary cost.

**How to apply:** Flag as HIGH (SC 1.4.11) on any audit touching ToggleSwitch. The fix is a one-token swap in the shared primitive, so a single fix cascades to all consumers.

See also: [[toggle-switch-sr-only-name-override]] for a prior ToggleSwitch fix (sr-only span removed).
