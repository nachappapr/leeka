---
name: coral-on-white-contrast
description: text-coral (#f46a39) on bg-card (#ffffff) = 3.01:1; fails 4.5:1 for normal text; barely passes 3:1 for large text (>=18.67px bold or >=24px normal)
metadata:
  type: project
---

`text-coral` (#f46a39) on `bg-card` (#ffffff) = **3.01:1** (exact: 3.0141).
`text-coral` (#f46a39) on `bg-background` (#fbf6ef, cream) = **2.80:1**.

- For **normal text** (below 18.67px bold / below 24px normal): FAILS SC 1.4.3 (need ≥4.5:1).
- For **large text** (≥18.67px bold or ≥24px normal): 3.01:1 technically PASSES SC 1.4.3 (need ≥3:1) by the slimmest margin. Treat as a medium-risk pass — sub-pixel rendering can erode this. Flag as a design concern and recommend coral-press.
- `text-coral-press` (#d9531f) on `bg-card` = **4.03:1** — passes large-text 3:1 with headroom; still fails normal-text 4.5:1.

Known occurrences:
- Dashboard "View all" button label: normal-sized text → HIGH (SC 1.4.3).
- Invoice detail ID (text-h2, 28px/800): large text → PASSES 3:1 barely; worth noting as design debt.
- Invoice detail avatar initials (22px/800): large text → PASSES 3:1 barely.

**Why:** coral is the brand accent; it is not dark enough for body text on white/cream. The threshold is whether the element is large text per WCAG definition.

**How to apply:** Always flag `text-coral` on normal text. For large text on bg-card: note the barely-passing ratio and recommend coral-press for safety margin. See [[coral-contrast]] for gradient-background ratios.
