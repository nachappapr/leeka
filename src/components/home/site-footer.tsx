import Link from "next/link";

import { LekkaLogo, IndiaFlagStripe } from "@/components/icons";
import { FOOTER_NAV, FOOTER_LANGS } from "@/lib/constants/home";

function SiteFooter() {
  return (
    <footer className="bg-ink pt-18 pb-8 text-card">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Top grid — 4 cols desktop, 3 cols tablet, 2 cols mobile */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 max-tablet:grid-cols-[2fr_1fr_1fr] max-mobile:grid-cols-2 max-mobile:gap-8">
          {/* Brand cluster — spans full width at tablet/mobile */}
          <div className="max-tablet:col-span-3 max-mobile:col-span-2">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-nav-item bg-coral">
                <LekkaLogo className="size-5" aria-hidden="true" />
              </div>
              <span className="text-20 font-extrabold tracking-tight">
                arthapatra<span className="text-coral">.</span>
              </span>
            </div>

            {/* Tagline */}
            <p className="mt-3.5 max-w-80 text-body-sm leading-snug text-card/60">
              Free invoicing app for India&#39;s small shops, home businesses, and traders. Made
              with love in Bengaluru.
            </p>

            {/* Language pills */}
            <div className="mt-4.5 flex flex-wrap gap-1.5">
              {FOOTER_LANGS.map((lang) => (
                <span
                  key={lang.code}
                  lang={lang.code === "en" ? undefined : lang.code}
                  className="rounded-full bg-card/6 px-2.5 py-1 text-12 font-semibold text-card/80"
                >
                  {lang.label}
                </span>
              ))}
            </div>
          </div>

          {/* Nav groups */}
          {FOOTER_NAV.map((group) => (
            <div key={group.id}>
              <h5 className="mb-3.5 text-12 font-extrabold uppercase tracking-wider text-card/50">
                {group.heading}
              </h5>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-body-sm font-medium text-card/80 transition-colors hover:text-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-press focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-card/8 pt-5.5 text-13 text-card/50">
          <div>© 2026 ArthaPatra Technologies Pvt Ltd. All rights reserved.</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-card/6 px-3 py-1.5 font-bold">
            <IndiaFlagStripe className="rounded-sm" aria-hidden="true" />
            Made in India
          </div>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
