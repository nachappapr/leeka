---
name: tablist-without-panels-section-nav
description: Mobile section strips using role=tablist with no tabpanels or arrow-key nav — wrong pattern; correct model is nav+aria-current matching the desktop aside
metadata:
  type: project
---

`SettingsSectionTabs` uses `role="tablist"` / `role="tab"` / `aria-selected` on a mobile horizontal scroll strip that controls a *single* conditionally-rendered panel (inactive sections are unmounted, not hidden). This violates the APG Tabs contract in three ways: (1) no `id` on tabs → no `aria-controls`, (2) panel has no `role="tabpanel"` / `aria-labelledby`, (3) no arrow-key roving-tabIndex navigation.

The correct pattern when inactive sections are unmounted is NOT Tabs. Use `<nav aria-label="...">` + `<ul><li><button aria-current>` — exactly what the desktop `SettingsSectionAside` already does correctly. The mobile strip should mirror the desktop nav model, not a Tabs model.

**Why:** APG Tabs requires all panels to be in the DOM (just hidden), or at minimum requires live `aria-controls` targets. A conditional-render architecture is incompatible with the Tabs role contract.

**How to apply:** When auditing any horizontal strip that drives conditional section rendering, default to: is it nav/list (correct) or tablist (wrong unless panels are in-DOM)?

See also: [[tablist-without-tabpanels]] (same pattern on format selector).
