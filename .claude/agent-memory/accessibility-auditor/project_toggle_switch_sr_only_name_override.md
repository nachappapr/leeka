---
name: toggle-switch-sr-only-name-override
description: ToggleSwitch sr-only state span inside button overrides the associated label name; AT hears "On"/"Off" not the label text
metadata:
  type: project
---

`ToggleSwitch` (`src/components/ui/custom/toggle-switch.tsx`) has a `<span className="sr-only">{checked ? "On" : "Off"}</span>` inside the `<button role="switch">`. Per the accessible name computation algorithm, a button's subtree text supersedes the externally associated `<label>` (via `htmlFor`/`id`). Result: AT announces "On, switch" or "Off, switch" — the label text ("Include GST by default on new invoices") is never read.

**Why:** `aria-checked` on `role="switch"` already conveys on/off state. The sr-only span is redundant for state and actively harmful for name resolution.

**How to apply:** Remove the `<span className="sr-only">` from inside the button. The label association via `htmlFor`/`id` then correctly provides the accessible name. State is conveyed by `aria-checked`. Apply globally — every consumer of `ToggleSwitch` is affected (TaxSection: 3 toggles, NotificationsSection: 5 toggles).
