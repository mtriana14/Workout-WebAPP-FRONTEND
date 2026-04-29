import { apiClient } from "@/lib/api";

export interface ActivityLog {
  log_id: number;
  user_id: number;
  exercise_id: number | null;
  exercise_name: string | null;
  activity_type: "strength" | "cardio" | "steps" | "calories";
  sets_completed: number | null;
  reps_completed: number | null;
  weight_used: number | null;
  notes: string | null;
  log_date: string | null;
}

export const activityService = {
  logStrength: (payload: {
    log_date: string;
    exercise_id: number;
    sets_completed: number;
    reps_completed: number;
    weight_used: number;
    notes?: string;
  }) =>
    apiClient<{ message: string; log: ActivityLog }>("logs/strength", {
      method: "POST",
      body: payload,
    }),

  getLogs: (userId?: number) => {
    return apiClient<{ total: number; logs: ActivityLog[] }>("logs", { method: "GET" });
  },
};
