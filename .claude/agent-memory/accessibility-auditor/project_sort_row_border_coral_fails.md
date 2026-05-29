---
name: sort-row-border-coral-fails
description: border-coral (#f46a39) on bg-coral-soft (#ffe7da) = 2.54:1; fails SC 1.4.11 for control boundary; fix: border-coral-press (3.40:1 inside, 4.03:1 outside).
metadata:
  type: project
---

`SortRadioRow` active state uses `border-coral bg-coral-soft`. The border-coral (#f46a39) against the interior bg-coral-soft (#ffe7da) = 2.54:1 — below the 3:1 SC 1.4.11 threshold for control boundaries. Against the external bg-card (#ffffff) it's 3.01:1 (barely passes), but the inside-facing surface fails.

**Why:** SC 1.4.11 requires the control boundary to achieve 3:1 against ALL adjacent colors. When the border sits between a dark outer background and a light interior, both surfaces count.

**How to apply:** For any selected/active state that pairs `border-coral` with a light soft background (`coral-soft`, `paid-soft`, `info-soft`, etc.), check BOTH the interior and exterior contrast. `border-coral-press` (#d9531f) resolves this: 3.40:1 vs coral-soft and 4.03:1 vs white. Apply the same fix to any future status-coloured radio/checkbox row using the coral selection pattern.
