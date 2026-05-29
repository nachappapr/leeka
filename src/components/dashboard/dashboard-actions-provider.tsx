"use client"

import { createContext, useContext, useMemo, useState } from "react"

import { ExportInvoicesModal } from "@/components/invoices/export-invoices-modal"
import { DASH_SORTS } from "@/lib/constants/dashboard"
import { INVOICES } from "@/lib/constants/invoices"
import type { DashSortId } from "@/lib/types/dashboard"
import type { StatusPillStatus } from "@/components/ui/custom/status-pill"

interface DashboardActionsContextValue {
  sort: DashSortId
  statuses: ReadonlyArray<StatusPillStatus>
  setSort: (id: DashSortId) => void
  setStatuses: (statuses: StatusPillStatus[]) => void
  sortLabel: string
  filterLabel: string
  exportOpen: boolean
  openExport: () => void
  closeExport: () => void
}

const DashboardActionsContext = createContext<DashboardActionsContextValue | null>(null)

export function useDashboardActions(): DashboardActionsContextValue {
  const ctx = useContext(DashboardActionsContext)
  if (!ctx) {
    throw new Error("useDashboardActions must be used inside <DashboardActionsProvider>")
  }
  return ctx
}

interface DashboardActionsProviderProps {
  children: React.ReactNode
}

export function DashboardActionsProvider({ children }: DashboardActionsProviderProps) {
  const [sort, setSort] = useState<DashSortId>("newest")
  const [statuses, setStatuses] = useState<StatusPillStatus[]>([])
  const [exportOpen, setExportOpen] = useState(false)

  const sortLabel = useMemo(
    () => DASH_SORTS.find((s) => s.id === sort)?.label ?? DASH_SORTS[0].label,
    [sort],
  )

  const filterLabel = useMemo(
    () =>
      statuses.length === 0
        ? "All statuses"
        : statuses
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join(", "),
    [statuses],
  )

  const value = useMemo<DashboardActionsContextValue>(
    () => ({
      sort,
      statuses,
      setSort,
      setStatuses,
      sortLabel,
      filterLabel,
      exportOpen,
      openExport: () => setExportOpen(true),
      closeExport: () => setExportOpen(false),
    }),
    [sort, statuses, sortLabel, filterLabel, exportOpen],
  )

  return (
    <DashboardActionsContext.Provider value={value}>
      {children}
      <ExportInvoicesModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        invoices={INVOICES}
        initialFormat="pdf"
      />
    </DashboardActionsContext.Provider>
  )
}
