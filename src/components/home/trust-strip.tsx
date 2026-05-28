import { Star, IndiaFlagStripe } from "@/components/icons"
import { TRUST_ITEMS } from "@/lib/constants/home"

function TrustStrip() {
  return (
    <div className="border-y border-border bg-card py-5">
      <div className="mx-auto max-w-7xl px-8 max-mobile:px-5 flex flex-wrap items-center justify-center gap-10 max-mobile:grid max-mobile:grid-cols-2 max-mobile:gap-x-5 max-mobile:gap-y-3.5 text-13 font-semibold text-ink-2">
        {TRUST_ITEMS.map((item) => {
          if (item.kind === "emphasis") {
            return (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 max-mobile:flex-col max-mobile:items-center max-mobile:text-center max-mobile:gap-0.5"
              >
                <strong className="font-extrabold text-ink">
                  {item.emphasis}
                </strong>
                <span>{item.label}</span>
              </span>
            )
          }

          if (item.kind === "rating") {
            return (
              <span
                key={item.id}
                className="inline-flex items-center gap-2 max-mobile:flex-col max-mobile:items-center max-mobile:text-center max-mobile:gap-1"
              >
                <span
                  aria-label={`${item.rating} out of ${item.outOf} stars`}
                  className="inline-flex items-center gap-0.5"
                >
                  {Array.from({ length: item.outOf }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </span>
                <span>{item.label}</span>
              </span>
            )
          }

          // kind === "flag"
          return (
            <span
              key={item.id}
              className="inline-flex items-center gap-2 max-mobile:justify-center"
            >
              <IndiaFlagStripe aria-hidden="true" className="rounded-sm" />
              {item.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export { TrustStrip }
