---
name: filter-chips-border-contrast
description: Inactive filter chip border (border-border #ece3d4 on bg-card #ffffff) = 1.27:1; fails SC 1.4.11; fix: border-ink-3 (#6f6253) = 5.92:1
metadata:
  type: project
---

Inactive filter chip uses `border border-border` for its sole visual boundary against the white card background.

`border-border` = `#ece3d4` on `bg-card` = `#ffffff` → **1.27:1** — fails WCAG 1.4.11 (UI component boundary requires 3:1).

**Why:** `--border` token (#ece3d4) is the global divider token, not designed for UI component boundaries against white. A button's outline must reach 3:1 against the adjacent surface.

**How to apply:** Change `border-border` to `border-ink-3` (`#6f6253`, 5.92:1 on white). No new tokens needed. Pure Tailwind class swap; no client boundary impact. Confirm fix is also applied if chip ever renders on non-white surface.

Related: [[bare-button-focus-ring]], [[filter-chips-live-region]]
