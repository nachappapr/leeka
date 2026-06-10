export type AgingTone = "paid" | "pending" | "overdue";

export interface AgingBucket {
  label: string;
  amount: string;
  percent: number; // 0–100
  tone: AgingTone;
}
