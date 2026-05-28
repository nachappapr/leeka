---
name: icon-only-button-mobile-responsive
description: Responsive icon-only buttons that hide text with display:none lose their accessible name; sr-only is the correct pattern
metadata:
  type: project
---

A button that collapses to icon-only on mobile using `max-mobile:hidden` on the text span and `aria-hidden="true"` on the icon has **no accessible name** on mobile — both the text and icon are removed from the AT tree. This is Critical WCAG 4.1.2 / 2.5.3.

**Fix pattern:** Replace `max-mobile:hidden` with `sr-only` on the text span, and keep `aria-hidden="true"` on the decorative icon. `sr-only` hides text visually while keeping it in the accessibility tree as the button's name. Do NOT use `aria-label` on the outer PillButton if it is rendered as a `<Link>` (Base UI passes props through) — verify `aria-label` survives the `render` prop.

**Why:** `display:none` / Tailwind `hidden` removes the element from AT. `visibility:hidden` also removes it. Only `sr-only` (clip-based) keeps content accessible while hiding it visually.

**How to apply:** Whenever a responsive button uses `max-mobile:hidden` or `max-tablet:hidden` on the visible label text, check whether the icon has a non-hidden accessible name fallback. If not, flag Critical.
