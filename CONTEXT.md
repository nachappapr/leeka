# ArthaPatra

A WhatsApp-first invoicing app for small Indian vendors: create invoices, send them to customers, track payment.

## Language & localization

**Locale**:
A supported language the app renders in. The set is exactly `en` (English), `hi` (Hindi), `kn` (Kannada). Persisted per user as `profiles.language`.
_Avoid_: language code, i18n key

**App chrome**:
Static, vendor-facing UI text — navigation, buttons, form labels, headings, toasts, empty states. This is the only text that gets translated across Locales.
_Avoid_: UI copy, interface strings

**Invoice output**:
The customer-facing content a vendor sends out — the WhatsApp message, the PDF, and the public `/pay` invoice page. Deliberately **not** localized by the app-language setting (a separable, per-customer concern).
_Avoid_: invoice text, customer-facing copy

**Preferred language**:
A vendor's chosen Locale for their own App chrome. One value per user (a business may have several members, each with their own). Source of truth is `profiles.language`; mirrored to a cookie for fast per-request reads.
_Avoid_: app language setting, UI language

**User-generated content**:
Data a vendor enters — customer names, item names, business name, invoice notes, amounts. Rendered verbatim in every Locale; never translated.
_Avoid_: dynamic content, user data
