---
name: project_aria_hidden_focusable_antipattern
description: aria-hidden=true on a focusable element (tabIndex=0) is an ARIA spec violation; title does not rescue the accessible name; Critical SC 4.1.2/2.1.1/2.4.3
metadata:
  type: project
---

In brand-toast.tsx the close button was given aria-hidden="true" + tabIndex={0} + title="Dismiss notification" to suppress Sonner's live-region from announcing the button's label on toast insertion. This is an ARIA spec violation (ARIA 1.2 §6.6.8: "authors MUST NOT use aria-hidden on a focusable element").

**Effect:** The element is entirely removed from the accessibility tree. title does not restore an accessible name — title is only exposed when the element *exists* in the acc tree; when aria-hidden=true removes it, screen readers never see the title. A keyboard user can Tab to the element (tabIndex is a DOM property, not ARIA state) but their screen reader announces nothing — the focus lands in a silent hole with no name, role, or action.

**WCAG mapping:**
- SC 4.1.2 (Name, Role, Value) — no name or role exposed (Critical)
- SC 2.1.1 (Keyboard) — focus reaches the element but AT cannot announce or operate it (Critical)
- SC 2.4.3 (Focus Order) — focus moves to an element absent from the acc tree (Critical)

**Correct fix — remove aria-hidden; suppress live-region chattiness another way:**
Option A (preferred): Remove aria-hidden entirely. Add `data-sonner-exclude` or render the close button *outside* the toast content div that Sonner's live region reads. Sonner reads the `data-content` subtree for its aria-live announcement; a button placed in a sibling div (not a descendant of the data-content node) is not swept into the announcement text.
Option B: Keep the button inside and accept Sonner announcing "Dismiss notification" — that was a Medium finding, not a Critical; trading a Medium for a Critical is always wrong.
Option C: Use Sonner's built-in `closeButton` prop on `<Toaster closeButton>`, which renders a properly named close button Sonner manages itself.

**How to apply:** Any time a fix involves aria-hidden on an interactive element (button, link, input, anything with tabIndex≥0 or naturally focusable), flag it as Critical immediately. title does not patch it. The only valid resolutions are: (a) make the element non-focusable if it truly must be hidden (tabIndex={-1} + aria-hidden, but then keyboard users can't reach it — usually wrong for a dismiss button), or (b) remove aria-hidden and find another way to solve the underlying problem.