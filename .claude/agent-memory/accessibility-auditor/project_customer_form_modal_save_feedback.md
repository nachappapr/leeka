---
name: project-customer-form-modal-save-feedback
description: a11y audit of customer-form-modal save-feedback diff (pending state, error live region, toast success/error) — 2026-06-14
type: project
---

**Role=alert conditional-render pattern — CORRECT in this diff.**
formError conditional render (`{formError && <p role="alert">…</p>}`) correctly uses null→insert insertion to fire role=alert in VoiceOver/NVDA. This is the right pattern per [[project-role-alert-always-rendered]].

**text-overdue on bg-card (modal footer) = 5.26:1 — PASSES SC 1.4.3.**

**Sonner custom toasts (toast.custom/JSX) are inside Sonner's aria-live="polite" <section>.**
The JSX is injected as the toast item child into the live region. AT announces on insertion. No separate live region needed. brandToast.error for error feedback is acceptable.

**Loader2 animate-spin has no motion-reduce:animate-none — recurring Medium SC 2.3.3 gap.**
Pattern: `<Loader2 className="size-4 animate-spin" aria-hidden />` must be `<Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />`. See [[project-animate-spin-no-prm]].

**isSubmitting pending state: no aria-busy or live region announce.**
The Save button is disabled={isSubmitting} (removes from tab order; AT reads it as dimmed) and changes icon only — no AT announcement that saving is in progress. Fix: add aria-busy={isSubmitting} on the Save button; or add a sr-only role=status region outside the button announcing "Saving…" / "" based on isSubmitting.

**How to apply:** aria-busy on the submit button is the minimal fix. A sr-only role=status sibling covers users who have already left the button focus. Either is acceptable; both is best.
