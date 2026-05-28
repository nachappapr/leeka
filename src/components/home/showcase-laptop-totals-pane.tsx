/**
 * ShowcaseLaptopTotalsPane — right pane of the laptop create-invoice screen mock.
 * Shows subtotal, GST, total, and action buttons. Decorative static content.
 */
function ShowcaseLaptopTotalsPane() {
  return (
    <div className="col-span-2 bg-card p-5 flex flex-col gap-3.5 max-mobile:col-span-1 max-mobile:px-3.5 max-mobile:py-4">
      {/* Subtotal row */}
      <div className="flex justify-between items-baseline text-13 text-ink-2 font-semibold">
        <span>Subtotal</span>
        <span className="tabular">₹4,500</span>
      </div>

      {/* GST row */}
      <div className="flex justify-between items-baseline text-13 text-ink-2 font-semibold">
        <span>GST · 5%</span>
        <span className="tabular">₹225</span>
      </div>

      {/* Total row */}
      <div className="border-t border-border pt-3.5 flex justify-between items-baseline">
        <div className="text-12 font-extrabold uppercase tracking-wide text-ink-3">
          Total
        </div>
        <div className="tabular text-28 font-extrabold tracking-tight">₹4,725</div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="rounded-full bg-coral text-card text-14 font-extrabold text-center py-3.5">
          Review &amp; send →
        </div>
        <div className="rounded-full bg-card text-ink border border-line-strong text-14 font-bold text-center py-3.5">
          Save draft
        </div>
      </div>
    </div>
  )
}

export { ShowcaseLaptopTotalsPane }
