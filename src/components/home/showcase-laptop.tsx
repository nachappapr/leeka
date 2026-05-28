import { ShowcasePhoneOverlay } from "@/components/home/showcase-phone-overlay"
import { ShowcasePaidCard } from "@/components/home/showcase-paid-card"
import { ShowcaseLaptopFrame } from "@/components/home/showcase-laptop-frame"

function ShowcaseLaptop() {
  return (
    <section
      id="showcase"
      className="bg-card overflow-hidden py-22 scroll-mt-20 max-tablet:py-16 max-mobile:py-12"
    >
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5">
        {/* Section head */}
        <div className="mx-auto mb-14 max-w-180 text-center">
          <span className="mb-2.5 inline-block text-12 font-extrabold uppercase tracking-widest text-coral-press">
            One app · every screen
          </span>
          <h2 className="text-44 font-extrabold leading-snug tracking-tight max-mobile:text-32">
            From the chai shop on your phone to the godown on your laptop.
          </h2>
          <p className="mt-3.5 text-18 leading-snug text-ink-2 max-mobile:text-body">
            ArthaPatra adapts to whatever device you have on hand. Same data, same
            login — big readable type, big tap targets, never confusing. We test
            with shop owners every week.
          </p>
        </div>

        {/* Showcase stage — laptop with absolute floating overlays */}
        <div className="relative max-w-270 mx-auto pb-15 max-mobile:pb-0">

          {/* Floating "Paid" card — top-left, decorative */}
          <ShowcasePaidCard />

          {/* Laptop frame */}
          <ShowcaseLaptopFrame />

          {/* Laptop hinge / base */}
          <div className="relative h-4 -mx-9 max-mobile:h-2.5 max-mobile:mx-0 bg-ink rounded-b-xl">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-22 h-1.5 bg-ink/80 rounded-b-lg max-mobile:hidden" />
          </div>

          {/* Phone overlay — right side, decorative, hidden on mobile */}
          <div
            className="absolute -right-5 bottom-3.5 z-10 max-mobile:hidden"
            aria-hidden="true"
          >
            <ShowcasePhoneOverlay />
          </div>
        </div>
      </div>
    </section>
  )
}

export { ShowcaseLaptop }
