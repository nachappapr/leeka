"use client"

import { BrandDatePicker } from "@/components/ui/custom/brand-date-picker"
import { FieldLabel } from "@/components/ui/custom/field-label"

interface ExportDateRangeProps {
  from: string
  setFrom: (v: string) => void
  to: string
  setTo: (v: string) => void
}

export function ExportDateRange({ from, setFrom, to, setTo }: ExportDateRangeProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mt-2.5 max-mobile:grid-cols-1">
      <div className="flex flex-col gap-1.5">
        <FieldLabel>From</FieldLabel>
        <BrandDatePicker
          value={from}
          onValueChange={setFrom}
          ariaLabel="From date"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel>To</FieldLabel>
        <BrandDatePicker
          value={to}
          onValueChange={setTo}
          ariaLabel="To date"
        />
      </div>
    </div>
  )
}
