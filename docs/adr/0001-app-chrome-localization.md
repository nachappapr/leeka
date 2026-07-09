# App-chrome localization: no URL-prefix, invoice output excluded

## Status

accepted

## Context

ArthaPatra needs to render its authenticated UI in English, Hindi, and Kannada for vendors who read those languages. Two decisions in how we did this are non-obvious and expensive to reverse, so they are recorded here.

## Decision

**1. No `[lang]` URL prefix — the active Locale is carried by a cookie backed by `profiles.language`.** The Next.js App Router i18n guide leads with sub-path routing (`/hi/dashboard`, everything moved under `app/[lang]/`). We deliberately did not do this. ArthaPatra is an authenticated app: there is no SEO or shareable-locale benefit, the Preferred language is already a saved per-user setting, and prefixing would force the entire `(app)` route group to move under `[lang]` and every internal link to carry the prefix. Instead the Locale resolves cookie → `profiles.language` → `en`, and the route structure is untouched.

**2. The app-language setting localizes App chrome only — Invoice output is deliberately out of scope.** Changing the vendor's interface language does not change what their customers receive (WhatsApp message, PDF, public `/pay` page). These are separable concerns: App chrome is one global per-vendor Locale, whereas Invoice output language is arguably per-customer (a vendor in Bengaluru may serve customers who read Kannada and others who read Hindi). Coupling them to one toggle would wrongly force every customer's invoice into the vendor's chosen language.

## Consequences

- Pages that read the Locale cookie are dynamic, not statically pre-rendered per Locale. Acceptable — the authenticated app is already dynamic (auth-scoped RPCs, no caching on report surfaces).
- Localizing Invoice output later is a **new** feature with its own per-customer language model, not an extension of this setting. A future reader should not "unify" the two.
- Adopting URL-prefix routing later would be a large migration; this ADR is the record that its absence is intentional, not an oversight.
