---
name: mobile-combobox-no-activedescendant
description: MobileSearchSheet missing aria-activedescendant + arrow-key navigation on combobox input — Critical APG gap
metadata:
  type: project
---

The mobile search combobox (`role="combobox"` input) has no `aria-activedescendant` attribute and no ArrowDown/ArrowUp keyboard handler. The desktop SearchPalette has both. This means mobile screen-reader users using a Bluetooth keyboard (common on budget Android, the Bahi target platform) cannot navigate search results at all from the input.

**Why:** Desktop was correctly implemented with `cursor` state, `setCursor` on arrow keys, `aria-activedescendant={... ? `sp-opt-${cursor}` : undefined}`, and `id={`sp-opt-${idx}`}` on each option. The mobile component was implemented separately and these attributes were omitted.

**How to apply:** Add `cursor` useState + `handleKeyDown` to MobileSearchSheet. Add `aria-activedescendant` on the input. Add `id="ms-opt-{idx}"` to each result option div (which itself must be `role="option"` not `<button>`). This is already a client component; no boundary cost.
