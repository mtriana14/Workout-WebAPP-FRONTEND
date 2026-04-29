import { apiClient } from "@/lib/api";

export interface CoachDashboard {
  coach_id: number;
  active_clients: {
    count: number;
    new_this_month: number;
  };
  earnings: {
    this_month: number;
    last_month: number;
    change_pct: number | null;
  };
  monthly_revenue: Array<{
    month: string;
    year: number;
    total: number;
  }>;
  recent_activity: Array<{
    client_name: string;
    action: string;
    log_type: string;
    log_date: string | null;
    created_at: string | null;
  }>;
}

export const coachDashboardService = {
  get: () =>
    apiClient<CoachDashboard>("coach/dashboard", {
      method: "GET",
    }),
};
