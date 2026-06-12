# WhatsApp Cloud API Onboarding — ArthaPatra

This document walks an operator through provisioning Meta's WhatsApp Cloud API so that ArthaPatra can send invoice payment-link messages to customers. Read every section before touching the Meta dashboard — the order of steps matters.

---

## 1. What ArthaPatra uses and why

### BSP vs Cloud API

There are two routes to send WhatsApp messages programmatically:

| Approach                             | Description                                                                                                                               | Trade-off                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **BSP (Business Solution Provider)** | A third-party aggregator (e.g. Interakt, Wati, Gupshup) sits between your app and Meta. You get a reseller dashboard and bundled support. | Higher per-message cost; another vendor dependency; the BSP re-hosts your data.                   |
| **Cloud API (direct)**               | You call Meta's Graph API (`graph.facebook.com`) directly with your own WABA credentials.                                                 | Lower cost; full control; requires your own Meta Business account and template approval workflow. |

**ArthaPatra uses the Cloud API directly.** The send helper (`src/lib/whatsapp/send.ts`) POSTs to `https://graph.facebook.com/{version}/{phoneNumberId}/messages` using your access token. There is no BSP in the path.

---

## 2. Meta Business and WABA setup

### 2.1 Create a Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com) and sign in with a personal Facebook account.
2. Create a new Business Account for ArthaPatra. One personal account can own multiple Business Accounts.
3. Complete business verification (required for higher messaging throughput and for sending to unregistered contacts). Upload a government-issued business document. Verification can take several days.

### 2.2 Create a Meta App with WhatsApp

1. Navigate to [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App**.
2. Select **Business** as the app type and associate it with the Business Account you created above.
3. On the app dashboard, click **Add Product** → find **WhatsApp** → click **Set up**.
4. This creates a WhatsApp Business Account (WABA) linked to your app.

### 2.3 Get your WhatsApp Business Account ID

After adding the WhatsApp product, the sidebar shows **WhatsApp → Getting started**. Note the **WhatsApp Business Account ID** — you will need it when adding a phone number in the next step.

---

## 3. Add and verify a business phone number

1. In the Meta App dashboard go to **WhatsApp → Phone Numbers** → **Add phone number**.
2. Enter the business display name and a phone number that is **not** already linked to a personal WhatsApp account. (You cannot use a number that runs the consumer app without first deleting that account.)
3. Meta sends a one-time verification code to the number via SMS or voice call. Enter the code in the dashboard.
4. After verification, the dashboard shows a **Phone Number ID** (a long numeric string, e.g. `123456789012345`). Copy this value — it becomes `WHATSAPP_PHONE_NUMBER_ID`.

---

## 4. Generate a permanent access token

The **Getting Started** page provides a temporary test access token that expires in 24 hours. For production you need a permanent (non-expiring) system user token:

1. In **Business Settings** → **Users** → **System Users** → **Add**.
2. Create a system user with **Employee** role.
3. Assign the system user to your app with **WhatsApp Business Messaging** permission.
4. Click **Generate new token** on the system user → choose your app → select the `whatsapp_business_messaging` scope → generate.
5. Copy the token immediately (it is shown only once). This becomes `WHATSAPP_ACCESS_TOKEN`.

> **Never log this token.** The send helper (`src/lib/whatsapp/send.ts`) deliberately omits the access token from all log statements.

---

## 5. Register a message template

ArthaPatra sends a single template message per invoice. You must register this template in Meta's template manager and wait for approval before any live messages can be sent.

### 5.1 Template category

Create the template under the **Utility** category. Utility templates cover transactional messages (invoices, receipts, order confirmations) and typically receive faster approval than Marketing templates.

### 5.2 Required template structure

The send helper (`src/lib/whatsapp/send.ts`, lines 72–92) builds a payload with exactly two components. Your registered template **must match this structure**:

| Component | Type     | Sub-type | Variable `{{1}}` | Runtime value                                              |
| --------- | -------- | -------- | ---------------- | ---------------------------------------------------------- |
| `body`    | `body`   | —        | `{{1}}`          | Invoice number, e.g. `INV-001`                             |
| `button`  | `button` | `url`    | `{{1}}`          | Full pay URL, e.g. `https://app.arthapatra.in/pay/<token>` |

**Language code: `en`** — the payload sends `language: { code: "en" }`. Do not register the template as `en_US`; that is a different language code and the message will fail to send.

### 5.3 Example template body text

```
Your invoice {{1}} is ready. Tap the button below to view and pay.
```

Where `{{1}}` is replaced at runtime by the invoice number (e.g. `INV-001`).

### 5.4 Example button configuration

In the template editor, add a **Call to Action** button:

- **Button type:** Visit Website (URL)
- **Button label:** e.g. "Pay Now"
- **URL type:** Dynamic
- **Website URL:** `https://app.arthapatra.in/pay/` (the static base)
- **Dynamic URL variable `{{1}}`:** the token suffix

The code passes the **full pay URL** (`https://app.arthapatra.in/pay/<token>`) as the button variable. When the template base URL is set to `https://app.arthapatra.in/pay/` and the variable holds the token, Meta appends the variable to the base. If your template uses a fully dynamic URL (base URL is `/`), the code still works because it passes the complete URL.

Set `WHATSAPP_TEMPLATE_NAME` to exactly the name you registered in the Meta template manager (case-sensitive).

### 5.5 Template approval

Meta reviews templates manually. Approval typically takes a few minutes to a few hours for Utility templates, but can take longer. You cannot send live messages until the template status is **Approved**. Monitor the status in **WhatsApp → Message Templates**.

### 5.6 No PDF attachment

This template is text and CTA button only. There is no PDF or document header. PDF invoice delivery is deferred to a future milestone and is not part of this template.

---

## 6. Register the webhook

The webhook lets Meta push delivery status updates (sent, delivered, read) back to ArthaPatra. These updates trigger the `mark_message_status` RPC which can transition an invoice's `viewed` state.

### 6.1 Webhook endpoint

The route is live at:

```
GET  /api/whatsapp/webhook   — Meta verification challenge
POST /api/whatsapp/webhook   — Status callbacks
```

In the Meta App dashboard go to **WhatsApp → Configuration** → **Webhook** → **Edit**.

Set the **Callback URL** to:

```
https://app.arthapatra.in/api/whatsapp/webhook
```

### 6.2 Verify token (GET challenge)

Set a **Verify Token** — any secret string you choose. Store this value in `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.

When Meta calls the GET endpoint to verify ownership, the route checks:

1. `hub.mode` equals `subscribe`
2. `hub.verify_token` equals your `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

If both match it echoes back `hub.challenge` as `text/plain` with HTTP 200. If either fails it returns 403.

When `WHATSAPP_WEBHOOK_VERIFY_TOKEN` is not set, the GET endpoint returns **503** so Meta's challenge fails cleanly rather than accepting an unverified endpoint.

### 6.3 App secret (POST signature verification)

Every POST from Meta includes an `X-Hub-Signature-256` header:

```
X-Hub-Signature-256: sha256=<hex-digest>
```

The digest is `HMAC-SHA256(rawBody, appSecret)` where `appSecret` is your Meta App's app secret.

To find your app secret: **App Dashboard → Settings → Basic → App Secret → Show**.

Store this value in `WHATSAPP_APP_SECRET`.

The route reads the raw request body as text **before** any JSON parsing (reparsing would alter the byte sequence and always fail verification), computes the expected HMAC, and compares using `timingSafeEqual` to prevent timing side-channel attacks.

When `WHATSAPP_APP_SECRET` is not set, the POST endpoint returns `200 { ok: true, skipped: true }` — Meta never sees a non-2xx and will not disable the endpoint.

### 6.4 Webhook fields subscription

After saving the callback URL and verify token, subscribe to the **messages** field. This is the field ArthaPatra consumes: the webhook payload shape is `entry[].changes[].value.statuses[]` and the `field` on each change entry is `messages`.

---

## 7. Environment variables

Set all variables in Vercel **Project Settings → Environment Variables**. The server validates them at startup via Zod — missing required vars (the non-WhatsApp ones) cause an immediate startup failure. The WhatsApp vars are all optional at parse time; the `isWhatsAppConfigured()` and `isWhatsAppWebhookConfigured()` helpers gate live calls at runtime.

### 7.1 Variable reference

| Variable                        | Purpose                                               | Required for live send                                                                                                                                  | Required for webhook                |
| ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `WHATSAPP_PHONE_NUMBER_ID`      | The numeric phone number ID from Meta → Phone Numbers | Yes (`isWhatsAppConfigured`)                                                                                                                            | No                                  |
| `WHATSAPP_ACCESS_TOKEN`         | System user permanent access token (secret)           | Yes (`isWhatsAppConfigured`)                                                                                                                            | No                                  |
| `WHATSAPP_TEMPLATE_NAME`        | Exact name of the approved template in WABA           | Yes (`isWhatsAppConfigured`)                                                                                                                            | No                                  |
| `WHATSAPP_API_VERSION`          | Graph API version string, e.g. `v21.0`                | No (defaults to `v21.0`)                                                                                                                                | No                                  |
| `WHATSAPP_APP_SECRET`           | Meta App → App Secret for HMAC verification           | No                                                                                                                                                      | Yes (`isWhatsAppWebhookConfigured`) |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Your chosen verify token for the GET challenge        | No                                                                                                                                                      | Yes (`isWhatsAppWebhookConfigured`) |
| `NEXT_PUBLIC_APP_URL`           | App public origin, e.g. `https://app.arthapatra.in`   | Pay link base (optional, but the fallback points at the Supabase project URL, not your dev server — always set this in `.env.local` for manual testing) | —                                   |

**Gate logic:**

- `isWhatsAppConfigured()` returns `true` only when `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_TEMPLATE_NAME` are all present. Any one missing → skip path.
- `isWhatsAppWebhookConfigured()` returns `true` only when `WHATSAPP_APP_SECRET` and `WHATSAPP_WEBHOOK_VERIFY_TOKEN` are both present.

None of the WhatsApp variables are `NEXT_PUBLIC_`. They are secrets and must never reach the browser.

### 7.2 Local development (`.env.local`)

Create or update `.env.local` at the repo root. This file is git-ignored and must never be committed.

```bash
# WhatsApp Cloud API — leave empty to run in skip mode locally
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_TEMPLATE_NAME=
WHATSAPP_API_VERSION=v21.0

# Webhook secrets
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Required for correct pay links during manual testing.
# Without this, the fallback points at your Supabase project URL (not the dev server).
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

When all WhatsApp vars are empty, `sendInvoice` runs in skip mode and the webhook returns benign responses. This is the expected local development path.

### 7.3 Vercel (production and preview)

```
Project Settings → Environment Variables
```

Set each variable for the target environment (Production, Preview, Development as needed). Vercel encrypts all values at rest. Do not set `WHATSAPP_ACCESS_TOKEN` or `WHATSAPP_APP_SECRET` as plain text in any committed config file.

After adding variables, **redeploy** for them to take effect. Environment variable changes do not hot-reload a running deployment.

---

## 8. Current limitations and honest test-mode status

This section describes what the system does today. Read it carefully before troubleshooting a "not working" report.

### 8.1 No WABA credentials yet

No Meta Business Account, WABA, or credentials have been provisioned for ArthaPatra. All `WHATSAPP_*` environment variables are currently unset. The server starts and runs normally without them.

### 8.2 Skip mode behavior (the expected current path)

When `isWhatsAppConfigured()` returns `false`:

- `sendInvoice` logs an info-level message, writes a `message_log` row with `status = 'skipped'`, writes an `invoice_events` row with `type = 'whatsapp.dispatched'` and `meta.outcome = 'skipped'`, and returns `{ ok: true, data: { ..., skipped: true } }`.
- It **never throws** and never returns `{ ok: false }` for the unconfigured case.
- The UI receives `{ ok: true, data: { skipped: true } }` and can display a "WhatsApp not configured" notice — not an error state.

When `isWhatsAppWebhookConfigured()` returns `false`:

- `GET /api/whatsapp/webhook` returns **503** — Meta's verification challenge will fail, which is correct (don't register the webhook until credentials are ready).
- `POST /api/whatsapp/webhook` returns `200 { ok: true, skipped: true }` — if Meta somehow reaches the endpoint it gets a 200 and will not retry or disable.

### 8.3 No invoice status mutation

`sendInvoice` does **not** change `invoices.status` or `invoices.sent_at`. Those columns are written by the `issue_invoice` RPC (AP-16). The WhatsApp dispatch is a separate, additive action that logs to `message_log` and `invoice_events` only.

### 8.4 No PDF attachment

The template is text and CTA button only. There is no PDF or document component in the template payload. PDF delivery is a separate future milestone.

### 8.5 Live end-to-end send is additionally blocked by invoice UI

Even after WABA credentials are provisioned, a live send will not succeed while the invoices list and detail pages use mock data. The `sendInvoice` action requires a real `invoiceId` UUID from the database. Call sites that pass an empty string `""` as the UUID will fail the invoice fetch guard before reaching the WhatsApp send. This is a known hook-point: when the invoices UI is wired to live data (real UUIDs), live WhatsApp sends will work end-to-end with no further changes to the send path.

---

## 9. End-to-end smoke test (once credentials are provisioned)

1. Set all 6 WhatsApp env vars in `.env.local` (or Vercel).
2. Ensure `NEXT_PUBLIC_APP_URL` is set to a reachable URL (use ngrok or a preview URL).
3. Issue an invoice (gives it a `public_token`).
4. Tap **Send via WhatsApp** in the invoice detail. Check Supabase: `message_log` row should appear with `status = 'sent'` and a `provider_msg_id`.
5. Register the webhook in Meta, subscribe to `messages`. Verify the GET challenge succeeds (status 200 in Meta logs).
6. After the customer opens the pay link, the webhook POST should arrive. Check `message_log.status` advances to `read`. If the invoice was previously `sent` (issued), check that `invoices.viewed_at` is now populated.

---

## Follow-ups (out of scope for this doc unit)

- Provision Meta Business Account, WABA, and generate real credentials.
- Wire invoices list and detail to live database data so `sendInvoice` receives real UUIDs.
- Template approval monitoring: set up a process to re-submit if Meta rejects or pauses the template.
- PDF attachment support (Epic 8 — deferred).
- Business verification follow-up: increased messaging limits require verified business status.
- `WHATSAPP_API_VERSION` pinning policy: decide when to bump from `v21.0` and how to test before bumping.
