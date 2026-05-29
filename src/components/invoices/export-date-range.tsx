"use client"

interface ExportDateRangeProps {
  from: string
  setFrom: (v: string) => void
  to: string
  setTo: (v: string) => void
}

export function ExportDateRange({ from, setFrom, to, setTo }: ExportDateRangeProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mt-2.5 max-mobile:grid-cols-1">
      <label className="flex flex-col gap-1.5">
        <span className="text-label font-bold text-ink-2">From</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-11 rounded-md border border-line-strong bg-card px-3 text-body-sm font-medium text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-label font-bold text-ink-2">To</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-11 rounded-md border border-line-strong bg-card px-3 text-body-sm font-medium text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </div>
  )
}
