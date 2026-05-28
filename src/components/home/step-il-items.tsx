function StepIlItems() {
  return (
    <div className="mt-4.5 overflow-hidden rounded-xl border border-border bg-background aspect-[16/10]">
      {/* Mac traffic lights */}
      <div className="flex h-4.5 items-center gap-1 border-b border-border bg-card px-2">
        <svg width="26" height="7" viewBox="0 0 26 7" fill="none" aria-hidden="true">
          <circle cx="3.5" cy="3.5" r="3.5" fill="#ED6A5E" />
          <circle cx="13" cy="3.5" r="3.5" fill="#F4BF50" />
          <circle cx="22.5" cy="3.5" r="3.5" fill="#61C554" />
        </svg>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        {/* Item row 1 */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-11">
          <span className="flex-1 truncate font-bold text-ink">Mithai Box</span>
          <span className="whitespace-nowrap tabular-nums font-bold text-ink-3">4 × ₹850</span>
        </div>

        {/* Item row 2 */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-11">
          <span className="flex-1 truncate font-bold text-ink">Kaju Katli</span>
          <span className="whitespace-nowrap tabular-nums font-bold text-ink-3">2 × ₹550</span>
        </div>

        {/* Total row */}
        <div className="flex items-center gap-2 rounded-lg bg-coral px-2.5 py-1.5 text-card">
          <span className="flex-1 text-9 font-extrabold uppercase tracking-wide opacity-90">Total</span>
          <span className="text-14 font-extrabold tabular-nums">₹4,725</span>
        </div>
      </div>
    </div>
  )
}

export { StepIlItems }
