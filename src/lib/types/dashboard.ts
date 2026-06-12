export interface DashboardStatusCounts {
  draft: number;
  sent: number;
  viewed: number;
  partial: number;
  pending: number;
  paid: number;
  overdue: number;
  cancelled: number;
}

export interface DashboardSummary {
  outstanding_amount: number;
  outstanding_count: number;
  overdue_amount: number;
  overdue_count: number;
  paid_this_month: number;
  status_counts: DashboardStatusCounts;
}

export const ZERO_DASHBOARD_SUMMARY: DashboardSummary = {
  outstanding_amount: 0,
  outstanding_count: 0,
  overdue_amount: 0,
  overdue_count: 0,
  paid_this_month: 0,
  status_counts: {
    draft: 0,
    sent: 0,
    viewed: 0,
    partial: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
  },
};
