---
name: project_role_alert_always_rendered
description: role=alert on a perpetually-rendered element (attributes patched, no DOM insertion) silently fails in most AT; element must be freshly inserted
metadata:
  type: project
---

`role="alert"` relies on the **DOM insertion** event to trigger announcement in VoiceOver, NVDA, and JAWS. When React reconciles an existing node by patching its attributes (changing `id`, `role`, `className`, and `textContent` on a `<p>` that was already in the DOM), most AT do not re-fire the live region — the node was never inserted.

**Pattern to flag:** A component like `FieldHint` that always renders a `<p>` and just swaps `id`, `role`, and `className` between hint-state and error-state. The `role="alert"` in error state will be silently ignored by AT.

**Correct pattern:** Conditional render — render `null` (or a sibling spacer) in the non-error state, and render a new `<p role="alert">` in the error state. React unmounts/mounts the node, the insertion fires the alert.

Example (correct):
```tsx
{error ? (
  <p id={id} role="alert" className="...">
    {error}
  </p>
) : (
  <p id={`${id}-hint`} className="...">
    {hint}
  </p>
)}
```

Note: the `id` must also be stable per state so `aria-describedby` can follow the switch.

**Why:** VoiceOver/NVDA listen for `DOMNodeInserted` or MutationObserver type=childList. A characterData / attribute mutation on an existing node does not re-trigger a live region.

**How to apply:** Whenever a single `<p>` element toggles between hint and error roles/classes without being conditionally rendered, flag as SC 4.1.3 High. First seen in `FieldHint` component in `business-wizard.tsx`.
