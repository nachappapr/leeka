---
name: coral-on-coral-soft-contrast
description: text-coral (#f46a39) on bg-sidebar-accent / coral-soft (#ffe7da) fails WCAG 1.4.11 at ~2.54:1; active nav icon in icon-rail mode
metadata:
  type: project
---

Active sidebar nav icon colour in icon-collapsed mode: `[&[data-active]_svg]:text-coral` applies #f46a39 on `data-active:bg-sidebar-accent` = #ffe7da background.

Measured contrast ratio: ~2.54:1 — fails WCAG SC 1.4.11 (UI components require ≥ 3:1).

**Why:** The coral brand colour (#f46a39) is inherently low-contrast against coral-soft (#ffe7da) because both are warm-orange toned; the lighter tint provides insufficient separation.

**How to apply:** Flag immediately on any active/selected icon using text-coral on coral-soft/sidebar-accent backgrounds. Fix: swap active SVG icon colour to `text-coral-press` (#d9531f) which is darker and was verified at 3.40:1 against coral-soft in [[icon-bubble-contrast-ratios]]. The consumer navButtonClass fix is in `src/components/ui/custom/sidebar.tsx` line 31 — change `[&[data-active]_svg]:text-coral` to `[&[data-active]_svg]:text-coral-press`.
