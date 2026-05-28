import { ShowcaseOutstandingCard } from "@/components/home/showcase-outstanding-card"
import { ShowcaseBillCard } from "@/components/home/showcase-bill-card"

function ShowcasePhoneOverlay() {
  return (
    <div className="w-52 h-110 bg-ink rounded-3xl p-1.5 shadow-float">
      <div className="w-full h-full bg-background rounded-3xl overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="flex h-7 shrink-0 items-center justify-between px-4 text-11 font-bold text-ink">
          <span>9:41</span>
          <span aria-hidden="true">•••</span>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 px-3.5 overflow-hidden">
          {/* Greet row */}
          <div className="flex items-center gap-2.5 pb-3">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-coral text-card text-11 font-extrabold">
              RK
            </div>
            <div>
              <div className="text-10 text-ink-3 font-semibold">
                <span lang="hi">नमस्ते,</span>
              </div>
              <div className="text-13 font-extrabold">
                <span lang="hi">राज कुमार</span>
              </div>
            </div>
          </div>

          {/* Outstanding card — coral gradient */}
          <ShowcaseOutstandingCard />

          {/* Recent bills label */}
          <div className="mt-3.5 text-10 font-extrabold uppercase tracking-wide text-ink-3">
            <span lang="hi">हाल के बिल</span>
          </div>

          {/* Bill cards */}
          <div className="mt-2 flex flex-col gap-2">
            <ShowcaseBillCard
              nameHi="शर्मा स्वीट्स"
              amount="₹4,725"
              statusClass="bg-paid-soft text-paid-ink"
              dotClass="bg-paid"
              statusHi="मिल गया"
            />
            <ShowcaseBillCard
              nameHi="अनीता टेलरिंग"
              amount="₹2,400"
              statusClass="bg-overdue-soft text-overdue-ink"
              dotClass="bg-overdue"
              statusHi="बाकी"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export { ShowcasePhoneOverlay }
