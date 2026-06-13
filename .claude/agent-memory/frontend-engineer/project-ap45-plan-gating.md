---
name: project-ap45-plan-gating
description: AP-45 Free vs Pro gating frontend — isPro threading pattern, export lock, invoice cap error surface
type: project
---

AP-45 shipped 2026-06-13. Pattern: `isPro(businessId)` called server-side in containers (InvoicesContainer, DashboardContainer), threaded to the client via `InvoiceListActionsProvider` context prop `isProUser: boolean` (default false). Never import plan.server.ts in a client component.

**GST Export lock**: `ExportTrigger` branches on `isProUser` from context — free users see disabled PillButton with Lock icon + inline "Pro" kicker badge (coral-soft/coral-ink, no new contrast violation). `ActionSheetRow` extended with optional `onClick`, `disabled`, `aria-label` for mobile locked row. `ExportInvoicesModal.handleSubmit` changed from anchor-click to `fetch()` so 403 responses can be caught and surfaced via `brandToast.error`.

**Invoice cap error**: `issueInvoice` wired for the first time to the "Issue invoice" CTA in `InvoiceActionsDraft` (desktop actions card) and `InvoiceDetailMobileFooter` (mobile footer). Cap error from the action surfaces via `brandToast.error`. Both surfaces use `useTransition` + `aria-live="assertive"` sr-only region for a11y.

**`invoiceUuid` prop added to `InvoiceActionsDraft`** — caller `InvoiceActionsCard` passes `invoice.invoiceUuid ?? ""`.

**Why:** server is source of truth for plan; isPro() is server-only import; passing boolean as prop is the SSR-safe pattern.
