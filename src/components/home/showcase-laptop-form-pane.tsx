/**
 * ShowcaseLaptopFormPane — left pane of the laptop create-invoice screen mock.
 * Decorative static content; aria-hidden is applied by the parent.
 */
function ShowcaseLaptopFormPane() {
  return (
    <div className="col-span-3 p-5 px-6 border-r border-border overflow-hidden max-mobile:border-r-0 max-mobile:border-b max-mobile:px-3.5 max-mobile:py-4">
      {/* Step indicator */}
      <div className="text-11 font-extrabold uppercase tracking-wide text-ink-3">
        Step 2 of 3
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-20 font-extrabold tracking-tight">Add items</div>
        <div className="text-12 font-bold text-ink-3">For Sharma Sweets</div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 rounded-sm bg-border overflow-hidden">
        <div className="h-full w-2/3 bg-coral rounded-sm" />
      </div>

      {/* Item cards */}
      <div className="mt-4 flex flex-col gap-2.5">
        {/* Item 1 */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-3.5 px-4">
          <div className="flex-1 min-w-0">
            <div className="text-14 font-bold">Premium Mithai Box · 500g</div>
            <div className="mt-0.5 text-11 text-ink-3 font-semibold tabular">
              4 × ₹850
            </div>
          </div>
          <div className="tabular text-16 font-extrabold">₹3,400</div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-3.5 px-4">
          <div className="flex-1 min-w-0">
            <div className="text-14 font-bold">Kaju Katli · 250g</div>
            <div className="mt-0.5 text-11 text-ink-3 font-semibold tabular">
              2 × ₹550
            </div>
          </div>
          <div className="tabular text-16 font-extrabold">₹1,100</div>
        </div>

        {/* Add another */}
        <div className="rounded-xl border border-dashed border-line-strong p-3 text-center text-13 font-bold text-coral-press">
          + Add another item
        </div>
      </div>
    </div>
  )
}

export { ShowcaseLaptopFormPane }
