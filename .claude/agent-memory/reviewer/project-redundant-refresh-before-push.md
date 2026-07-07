---
name: project-redundant-refresh-before-push
description: router.refresh() immediately before router.push() to a different route is redundant dead weight, not a correctness bug — flag as Medium
metadata:
  type: project
---

Found in `src/components/customers/customer-edit-trigger.tsx` (issue #30 frontend half, delete flow): `handleDelete` called `router.refresh()` then `router.push("/customers")` on success, right after the Server Action (`deleteCustomerAction`) already called `revalidateBusiness(businessId)` → `updateTag(dashboardTag/invoicesTag/customersTag)`.

**Why:** `router.refresh()` only re-fetches Server Component data for the *current* route. When followed immediately by `router.push()` to a different route, that refetch is thrown away before it's used — pure wasted round-trip. The destination route already gets fresh data from the mutation's own `updateTag` calls; `router.refresh()` adds nothing. Confirmed via repo-wide grep that this pairing appears nowhere else — every other delete-and-leave flow in the codebase (invoice delete from edit page, draft-save-and-leave, auth/onboarding transitions) calls `router.push()` alone and trusts server-side cache-tag invalidation.

**How to apply:** When reviewing a mutation handler that both refreshes and navigates away in the same success branch, flag `router.refresh()` as Medium (#3 cache-tag correctness / redundant revalidation) — not Critical, since it doesn't cause staleness (the opposite failure mode: over-invalidation, not under). Confirm the mutation's Server Action already calls the relevant `updateTag`s before treating the client-side `refresh()` as necessary. Fix direction: drop `router.refresh()`, keep `router.push()` alone, unless the same handler needs to keep the *current* page fresh without navigating (then `refresh()` alone, no push, is correct — see `mark-all-read-button.tsx`, `topbar-notifications-client.tsx` for the legitimate single-page-refresh pattern).

See also [[project-revalidate-business-centralized-tags]].
