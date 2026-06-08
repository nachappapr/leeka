---
name: project-inline-style-bg-vs-css-var
description: Recurring pattern mis-application — inline style with both CSS var setter and a direct CSS property; only the var setter is sanctioned
metadata:
  type: project
---

The AGENTS.md sanctioned inline style exception covers ONLY CSS variable setters, e.g. `style={{ ['--accent']: tone }}`. Consuming that variable must go via a Tailwind arbitrary class, e.g. `bg-[--accent]`.

Implementers sometimes write both the CSS var setter AND a direct property in the same style object:
```tsx
style={{ ["--plan-bg"]: "linear-gradient(...)", background: "var(--plan-bg)" }}
```
The `background:` key here is NOT a CSS variable setter — it is a direct inline style property. This bypasses Tailwind and is not covered by the exception. The correct form:
```tsx
// eslint-disable-next-line no-restricted-syntax -- data-driven CSS var
style={{ ["--plan-bg" as string]: "linear-gradient(...)" }}
className="bg-[--plan-bg]"
```

**Why:** AGENTS.md only sanctions `style={{ ['--name']: value }}` for data-driven CSS variables. Direct CSS property assignments (background, color, padding, etc.) in style objects are banned even when they reference CSS variables.

**How to apply:** Flag as Medium #12 when a style object contains direct CSS property assignments (background, color, width, etc.) even alongside or referencing a CSS variable. The fix is always to use the Tailwind arbitrary class syntax to consume the CSS var.

See also: [[project-globals-css-animation]] for the related "no unauthorized token" rule.
