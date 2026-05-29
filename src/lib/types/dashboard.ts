export type DashSortId =
  | "newest"
  | "oldest"
  | "amtHigh"
  | "amtLow"
  | "nameAZ"

export interface DashSortOption {
  id: DashSortId
  label: string
  hint: string
  iconKey: "arrowDown" | "arrowUp" | "rupee" | "user"
}
