---
name: char-count-describedby
description: Textarea char count ({n}/280) is a visible <p> not linked via aria-describedby to the textarea — SR users can't discover the character limit or current count.
metadata:
  type: project
---

`NoteField` renders a `<p>{note.length}/280</p>` char counter that is not associated with the textarea via `aria-describedby`. Screen-reader users navigating to the field will not hear the character limit. The counter also lacks a live region, so the current count is not announced as the user types.

**Fix:** Give the `<p>` a stable `id` (e.g. `send-modal-note-count`) and add `aria-describedby="send-modal-note-count"` to the `<textarea>`. The counter should also have `aria-live="polite"` so that count updates are announced at a reasonable cadence (or `aria-atomic="true"` if you want the full "X/280" re-read each time).

**Why:** SC 1.3.1 — information (limit) must be programmatically determinable. SC 4.1.3 — dynamic count update is a status message.

**How to apply:** Any character-limited input must link its counter via aria-describedby AND give the counter element aria-live="polite".
