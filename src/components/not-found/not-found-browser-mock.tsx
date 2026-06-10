import { Check, TornDoc, LinkBroken } from "@/components/icons";
import { BrowserChrome } from "@/components/home/browser-chrome";

function NotFoundBrowserMock() {
  return (
    <div className="relative">
      <div
        className="absolute rounded-3xl pointer-events-none"
        // eslint-disable-next-line no-restricted-syntax -- peach gradient backdrop is a single-use decorative element; no design token exists or is warranted for this one-off rotated gradient
        style={{
          inset: "-18px -28px 28px -10px",
          background: "linear-gradient(155deg,#FFE7DA 0%,#FFD8C2 60%,#FFC09A 100%)",
          transform: "rotate(-1.5deg)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 overflow-hidden rounded-2xl border border-line bg-card shadow-float">
        <BrowserChrome
          host="app.arthapatra.in"
          path="/this-page"
          leadingIcon={<LinkBroken className="size-2.5 text-overdue shrink-0" aria-hidden="true" />}
          pathTone="overdue"
        />

        <div
          aria-hidden="true"
          className="flex flex-col items-center text-center px-9 pt-12 pb-11 min-h-95 justify-center bg-background max-mobile:px-6 max-mobile:pt-8 max-mobile:pb-7.5 max-mobile:min-h-62"
        >
          <div className="mb-6.5 max-mobile:mb-4.5">
            <TornDoc className="size-33 max-mobile:size-25" aria-hidden="true" />
          </div>

          <p className="text-title-sm font-extrabold text-ink">We couldn&apos;t find that page</p>
          <p className="mt-2 text-caption font-semibold text-ink-3 max-w-70">
            It may have been moved, or the address has a typo in it.
          </p>

          <span className="mt-4.5 inline-flex items-center gap-1.5 rounded-full bg-overdue-soft px-3 py-1 text-label font-extrabold text-overdue-ink">
            <span className="size-1.5 rounded-full bg-overdue shrink-0" aria-hidden="true" />
            No such record
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute z-20 bg-card rounded-lg shadow-float px-3.5 py-3 flex items-center gap-2.5 min-w-49 bottom-5.5 -right-7 animate-float-y max-mobile:hidden max-tablet:right-2"
      >
        <div className="size-8 rounded-nav-item shrink-0 flex items-center justify-center bg-paid text-card">
          <Check className="size-4.5" strokeWidth={2.6} aria-hidden="true" />
        </div>
        <div>
          <p className="text-label font-extrabold text-ink">Your data is safe</p>
          <p className="text-label text-ink-3 font-semibold">Nothing was lost</p>
        </div>
      </div>
    </div>
  );
}

export { NotFoundBrowserMock };
