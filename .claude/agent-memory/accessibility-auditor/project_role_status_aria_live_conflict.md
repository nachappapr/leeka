---
name: role-status-aria-live-conflict
description: role=status has implicit aria-live=polite; overriding with aria-live=assertive on the same element creates a conflict. Loading states should use polite, not assertive.
metadata:
  type: project
---

`role="status"` carries an implicit `aria-live="polite"` per the ARIA 1.2 spec. Setting `aria-live="assertive"` on the same element creates a conflict; the resolved behavior depends on the AT (some prefer the explicit attribute, some the role implicit).

More importantly: **loading/in-progress states should use polite, never assertive**. `aria-live="assertive"` is reserved for time-critical interruptions (errors requiring immediate action, expiring session countdowns). Announcing "Issuing invoice…" with assertive will interrupt the user's current reading flow mid-sentence.

**Pattern seen in AP-45 (invoice-actions-draft.tsx:76, invoice-detail-mobile-footer.tsx:108):**
```tsx
<p role="status" aria-live="assertive" aria-atomic="true" className="sr-only">
  {isPending ? "Issuing invoice…" : ""}
</p>
```

**Correct pattern:**
```tsx
<p role="status" aria-atomic="true" className="sr-only">
  {isPending ? "Issuing invoice…" : " "}
</p>
```
Drop `aria-live="assertive"`. Use ` ` (non-breaking space) instead of `""` to prevent the AT from announcing an empty-string change when the operation completes.

**How to apply:** Any sr-only live region for loading/pending state: `role="status"` only, no explicit `aria-live`. Only use `role="alert"` (which is assertive-implicit) for actual error conditions that require the user's immediate attention — even then, prefer it on a conditionally-inserted element (not an always-present region with changing content).
