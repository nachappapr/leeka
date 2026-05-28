import { Check } from "@/components/icons"

function ShowcasePaidCard() {
  return (
    <div
      className="absolute left-8 -top-10 z-10 bg-card rounded-2xl px-4.5 py-3.5 shadow-float min-w-50 max-mobile:hidden"
      aria-hidden="true"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-paid text-card mb-2.5">
        <Check className="size-5.5" strokeWidth={2.8} aria-hidden="true" />
      </div>
      <div className="text-11 font-extrabold text-paid-ink uppercase tracking-wide">
        Paid · via UPI
      </div>
      <div className="tabular text-22 font-extrabold text-paid tracking-tight mt-0.5">
        + ₹4,725
      </div>
      <div className="text-11 text-ink-3 font-semibold mt-0.5">
        From Sharma Sweets
      </div>
    </div>
  )
}

export { ShowcasePaidCard }
