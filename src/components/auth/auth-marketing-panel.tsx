import { LekkaLogo, Check } from "@/components/icons";
import { TRUST_MARKS } from "@/lib/constants/auth";
import { BrowserPreviewCard } from "@/components/auth/browser-preview-card";

function AuthMarketingPanel() {
  return (
    // Desktop: coral gradient panel | Tablet: transparent header over container gradient | Mobile: own gradient
    <aside
      aria-label="About ArthaPatra"
      className="relative flex h-full min-h-screen flex-col overflow-hidden px-14 py-10 text-white [background:linear-gradient(160deg,#F46A39_0%,#E94A1F_55%,#B83A14_100%)] max-tablet:[background:transparent] max-tablet:block max-tablet:overflow-visible max-tablet:min-h-0 max-tablet:p-0 max-tablet:max-w-155 max-tablet:mx-auto max-mobile:flex max-mobile:flex-col max-mobile:overflow-hidden max-mobile:min-h-0 max-mobile:px-5 max-mobile:py-5 max-mobile:[background:linear-gradient(160deg,#F46A39_0%,#E94A1F_55%,#B83A14_100%)]"
    >
      {/* Layered gradient overlays — hidden at tablet (container carries them); restored at mobile */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 max-tablet:hidden max-mobile:block [background:radial-gradient(120%_80%_at_0%_0%,rgba(255,255,255,0.10)_0%,transparent_60%)]" />
        <div className="absolute inset-0 max-tablet:hidden max-mobile:block [background:radial-gradient(80%_60%_at_100%_100%,rgba(0,0,0,0.18)_0%,transparent_60%)]" />
        <div className="absolute -top-32 -right-32 size-130 rounded-full bg-white/18 blur-3xl max-tablet:size-105 max-tablet:-top-45 max-tablet:-right-30 max-tablet:opacity-60 max-mobile:hidden" />
        <div className="absolute -bottom-24 -left-24 size-95 rounded-full bg-white/12 blur-3xl max-tablet:hidden" />
      </div>

      {/* Brand row */}
      <div className="relative flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-white/28 bg-white/18 backdrop-blur-sm">
          <LekkaLogo className="size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-title font-extrabold leading-none tracking-tight text-white">
            arthapatra<span className="text-coral-press">.</span>
          </span>
          <span className="mt-0.5 text-kicker font-semibold uppercase tracking-widest text-white/70">
            Invoicing
          </span>
        </div>
      </div>

      {/* Headline — desktop: mt-auto to bottom | tablet: mt-0 follows brand row | mobile: mt-8 */}
      <div className="relative mt-auto pt-12 max-tablet:mt-0 max-tablet:pt-7 max-mobile:mt-8 max-mobile:pt-0">
        <h1 className="text-44 font-extrabold leading-tight tracking-tight max-tablet:text-36 max-mobile:text-h2">
          Invoices in your pocket.{" "}
          <span className="rounded-sm bg-white/25 px-1">Get paid faster.</span>
        </h1>
        <p className="mt-4.5 max-w-115 text-17 leading-relaxed text-white/80 max-tablet:mt-3 max-tablet:max-w-135 max-tablet:text-body max-mobile:max-w-none max-mobile:text-15">
          Free web invoicing for India&apos;s small shops, home bakers, tailors
          and traders. Open it on your phone in the morning, switch to your
          laptop in the afternoon — same data, same login.
        </p>

        {/* Mini browser preview — hidden at tablet + mobile */}
        <div className="mt-8 max-w-135 max-tablet:hidden">
          <BrowserPreviewCard />
        </div>

        {/* Trust marks — tablet: horizontal wrap | mobile: hidden */}
        <ul
          className="mt-9 flex flex-col gap-2.5 max-tablet:mt-7 max-tablet:flex-row max-tablet:flex-wrap max-tablet:gap-x-5.5 max-tablet:gap-y-2.5 max-mobile:hidden"
          aria-label="Key features"
        >
          {TRUST_MARKS.map((mark) => (
            <li key={mark} className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Check className="size-3 text-white" aria-hidden="true" />
              </span>
              <span
                className="text-caption font-semibold text-white/90"
                lang={mark.includes("हिंदी") ? "hi" : undefined}
              >
                {mark}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export { AuthMarketingPanel };
