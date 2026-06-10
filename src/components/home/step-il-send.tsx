function StepIlSend() {
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
      <div className="flex flex-col gap-2 px-3.5 py-3">
        {/* Label */}
        <div className="text-10 font-extrabold uppercase tracking-wide text-ink-3">
          Send INV-1024 via
        </div>

        {/* Channel buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5 rounded-lg bg-whatsapp px-2.5 py-2 text-11 font-bold text-card">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M20.5 11.5a8.5 8.5 0 1 1-3.4-6.8L20.5 4l-.9 3.6a8.45 8.45 0 0 1 .9 3.9z" />
            </svg>
            WhatsApp
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-2 text-11 font-bold text-ink-2">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M4 6l8 7 8-7" />
            </svg>
            Email
          </div>
        </div>

        {/* Delivered status */}
        <div className="flex items-center gap-1.5 rounded-lg bg-paid-soft px-2.5 py-2 text-10 font-extrabold text-paid-ink">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          Delivered · viewed
        </div>
      </div>
    </div>
  );
}

export { StepIlSend };
