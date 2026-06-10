function StepIlSearch() {
  return (
    <div className="mt-4.5 overflow-hidden rounded-xl border border-border bg-background aspect-[16/10]">
      {/* Mac traffic lights — inline SVG, hex fills are SVG attributes not className */}
      <div className="flex h-4.5 items-center gap-1 border-b border-border bg-card px-2">
        <svg width="26" height="7" viewBox="0 0 26 7" fill="none" aria-hidden="true">
          <circle cx="3.5" cy="3.5" r="3.5" fill="#ED6A5E" />
          <circle cx="13" cy="3.5" r="3.5" fill="#F4BF50" />
          <circle cx="22.5" cy="3.5" r="3.5" fill="#61C554" />
        </svg>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5">
        {/* Search input */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-11">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            aria-hidden="true"
            className="shrink-0 text-ink-3"
          >
            <circle cx="11" cy="11" r="6" />
            <path d="M16 16l5 5" />
          </svg>
          <span className="font-bold text-ink">shar</span>
          <span className="text-ink-3">ma…</span>
        </div>

        {/* Dropdown */}
        <div className="mt-1.5 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          {/* Highlighted option */}
          <div className="flex items-center gap-2 bg-coral-soft px-2.5 py-1.5 text-11">
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-coral text-card text-9 font-extrabold">
              SS
            </span>
            <span className="flex-1 font-bold text-ink">Sharma Sweets</span>
            <span className="whitespace-nowrap font-semibold text-ink-3">+91 · Lko</span>
          </div>
          {/* Second option */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 text-11">
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-coral-soft text-coral-ink text-9 font-extrabold">
              SK
            </span>
            <span className="flex-1 font-bold text-ink">Sandeep Kapoor</span>
            <span className="whitespace-nowrap font-semibold text-ink-3">+91 · Lko</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { StepIlSearch };
