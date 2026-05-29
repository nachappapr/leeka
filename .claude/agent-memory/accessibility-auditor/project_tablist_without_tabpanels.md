---
name: tablist-without-tabpanels
description: role=tablist/tab used as a 2-option format selector with no tabpanels — wrong APG pattern; correct pattern is radiogroup/radio
metadata:
  type: project
---

`ExportFormatTabs` uses `role=tablist` + `role=tab` + `aria-selected` but has **no tabpanels, no `aria-controls`, no roving tabindex, no arrow-key navigation**. This is a Critical APG Tabs contract violation.

**Why:** The APG Tabs pattern requires associated tabpanels; without them the pattern is semantically incorrect and misinforms AT users (who expect arrow-key navigation and Tab to jump to associated content). A 2-option format selector is a radiogroup, not a tablist.

**How to apply:** For a mutually-exclusive option selector (no associated panels, one always active):
- Use `role=radiogroup` on the container + `aria-label`
- Use `role=radio` + `aria-checked={isActive}` on each option button (native `<input type=radio>` visually hidden inside `<label>` also works)
- Add roving tabindex: active option = `tabIndex={0}`, others = `tabIndex={-1}`
- Add `onKeyDown` for Left/Right Arrow to move focus between options
- Already `"use client"` — no boundary cost

Do NOT use `role=tablist` for a selector control that has no tabpanels. See APG Radio Group pattern.
