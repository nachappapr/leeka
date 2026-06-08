---
name: project-false-server-component-claim
description: Components with no 'use client' and a "Server Component" comment that are imported and rendered inside 'use client' files — they become client modules silently
metadata:
  type: project
---

**Recurring pattern — two confirmed instances so far.**

**Instance 1 (invoice form v2):** `invoice-form-preview-sidebar.tsx` carried a comment "Server Component — no interactivity, no state, no effects" and had no `"use client"` directive, but was imported and rendered as JSX directly inside `invoice-create-form.tsx` and `invoice-edit-form.tsx` (both `"use client"`). Next.js bundles any module imported by a client file as a client module — the Server Component claim is false and misleading. The component also received live RHF reactive values as props, making true server rendering impossible.

**Instance 2 (mobile flow reconciliation):** `invoice-form-review-stage.tsx` (no `"use client"`) has a comment: "InvoiceFormReviewDesktopBar (client) and InvoiceFormLivePreview (server) are composed here". The "(server)" claim about `InvoiceFormLivePreview` is false — it is only ever imported by client-boundary files and thus lives in the client module graph. The misleading comment could cause a future developer to assume SSR-safety.

**Why:** In both cases the implementer correctly omitted `"use client"` from a presentational component (appropriate), but then added a comment asserting "(server)" status for its dependencies — which is wrong when those dependencies are imported into the client graph.

**How to apply:** When reviewing, flag any component comment that labels another component "(server)" when that component is only ever imported inside client module chains. The fix is to remove the "(server)" label from the comment; the component functions correctly as a client module and no directive change is needed. If the intent was genuine SSR composition, the server parent must instantiate the server component and pass it as `children`/prop to the client component — not the other way around. See [[project-rsc-client-import-boundary]].
