---
name: lekka-home-build
description: "Lekka home page rebuild — SUPERSEDED by ArthaPatra Home rebuild (web-first positioning). Old phone-mock hero + 3-phone showcase replaced by browser-mock hero + laptop+phone showcase."
metadata:
  type: project
---

# Lekka home page — old build SUPERSEDED 2026-05-28

The previous in-flight build (paused at N5, was going to resume at N6 with the 3-phone ShowcaseStrip) is no longer the design target.

**Why:** User shifted positioning from "WhatsApp-first Android app" to "web app for India's small businesses". The new design source is `/tmp/arthapatraDesign/invoice/project/ArthaPatra Home.html`. Material changes:

1. **Hero visual** — was a tilted phone mock with floating cards. Now a **browser window mock** (Mac-style chrome with traffic-light dots, address bar showing `app.lekka.in/dashboard`, sidebar + main dashboard inside). Floating cards remain (Paid + WhatsApp Delivered) but reposition relative to the browser, not the phone.

2. **Hero eyebrow** — was "Free · Made in India · WhatsApp-first". Now "Free · Made in India · Runs in your browser".

3. **Hero h1** — was 3-line "Send invoices / as easy as a / WhatsApp." Now 2-line "Invoicing as easy as a / WhatsApp." (`HeroUnderline` stays under WhatsApp.).

4. **Hero CTA primary** — "Get started free" → "Open Lekka free".

5. **Hero meta** — was "No credit card needed / Works offline / GST-ready". Now "No install, no credit card / Works on phone & desktop / GST-ready".

6. **Sub paragraph** — drop "No accounting jargon", add "Open it in any browser, create a bill in 60 seconds, send it on WhatsApp, get paid faster."

7. **TrustStrip** — drop "on Play Store" from the rating item; design says "4.8 average review". Re-positioning as browser app, not Play Store app.

8. **FeaturesGrid** — drop from 6 features to **5**: WhatsApp-first (lg, spans 2), Mark as paid, Gentle reminders, GST-ready, **Open in any browser** (new, replaces "Works on patchy signal" + "Languages"). Languages moves to FAQ implicit copy and footer chips.

9. **HowItWorks** — copy tweaks but structure identical (3 step cards with mock illustrations).

10. **ShowcaseStrip** — was 3 tilted phone mocks side-by-side. Now a **single laptop frame** containing the create-invoice screen (left form column + right total/CTA column), with a **floating "Paid · via UPI" card** overlapping the top-left, and a **phone mock** overlapping the bottom-right showing a Hindi dashboard. New name: probably rename to `ShowcaseLaptop` or keep `ShowcaseStrip` and swap internals.

11. **Pricing CTA labels** — Starter: "Get started for free", Pro: "Start 14-day free trial" (was both "Get started free").

12. **FAQs** — "Will it work on my phone?" now says "ArthaPatra runs in any modern phone browser…" (drop the "we support Android 6" line; web-first). "What if my internet is bad?" softens from "fully offline" to "caches the app, drafts sync when back online".

13. **CTA band** — H2 is now "Stop chasing payments. / Start running your shop." (two lines via `<br/>`). Sub: "Join 10,400+ vendors who get paid faster, on WhatsApp, with Lekka."

**How to apply:** When the user resumes this build, do NOT continue from N6 of the old plan. Plan a fresh decomposition from the new HTML and either rewrite or delete the obsolete component files. Components likely needing rewrite vs rebuild:

- **Rewrite**: `hero.tsx`, `hero-phone-mock.tsx` (replace with HeroBrowserMock), `hero-floating-cards.tsx` (reposition), `trust-strip.tsx` (rating label), `feature-card.tsx` (no logic change but FEATURES data shrinks), `cta-band.tsx` (copy), `faq.tsx` data
- **Delete or repurpose**: `showcase-paid-phone.tsx`, `showcase-create-phone.tsx`, `showcase-hindi-phone.tsx` (replace with HeroBrowserMock-style + new ShowcaseLaptop containing a phone overlay)
- **Keep mostly as-is**: `site-nav.tsx`, `mobile-drawer.tsx`, `how-it-works.tsx`, `step-card.tsx`, `step-illustration-*.tsx`, `testimonials.tsx`, `testimonial-card.tsx`, `pricing.tsx`, `pricing-plan.tsx`, `faq-item.tsx`, `site-footer.tsx`
- **Constants/types**: `src/lib/constants/home.ts` and `src/lib/types/home.ts` need updates (FEATURES drop 2 / add 1, HERO_META copy, TRUST_ITEMS rating label, FAQ copy, PRICING ctaLabel diff per plan, CTA_BAND copy)

The deferred `PillButton` contrast issue from the old build is still open but is tracked in reviewer/auditor memories, not here.
