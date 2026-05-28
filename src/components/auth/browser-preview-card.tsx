function BrowserPreviewCard() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl bg-white [box-shadow:0_30px_60px_rgba(40,15,4,0.35),0_8px_18px_rgba(40,15,4,0.18)]"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 rounded-full bg-surface px-3 py-1 text-11 font-semibold text-ink-3">
          arthapatra.app · dashboard
        </span>
      </div>

      {/* Body — padded grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="rounded-md bg-paid-soft p-3.5">
          <p className="text-10 font-extrabold uppercase tracking-wider text-paid-ink/70">
            Paid this month
          </p>
          <p className="mt-1.5 text-title font-extrabold tracking-tight tabular-nums text-paid-ink">
            ₹84,250
          </p>
        </div>
        <div className="rounded-md bg-overdue-soft p-3.5">
          <p className="text-10 font-extrabold uppercase tracking-wider text-overdue-ink/70">
            Outstanding
          </p>
          <p className="mt-1.5 text-title font-extrabold tracking-tight tabular-nums text-overdue-ink">
            ₹12,400
          </p>
        </div>
        <div className="col-span-2 flex items-center gap-2.5 rounded-md bg-surface-2 px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-coral-soft text-label font-extrabold text-coral-ink">
            SS
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold text-ink">Sharma Sweets</p>
            <p className="text-11 font-semibold text-ink-3">INV-024 · ₹4,725</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-paid-soft px-2.5 py-1 text-11 font-extrabold text-paid-ink">
            <span className="size-1.5 rounded-full bg-paid" />
            Paid
          </span>
        </div>
      </div>
    </div>
  )
}

export { BrowserPreviewCard }
