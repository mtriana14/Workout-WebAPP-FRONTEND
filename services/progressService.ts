import { apiClient } from "@/lib/api";

export interface ProgressEntry {
  entry_id: number;
  user_id: number;
  entry_date: string;
  weight: number | null;
  workouts_completed: number;
  calories_burned: number;
  goal_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  total_workouts: number;
  current_streak: number;
  weekly_calories: number;
  goals_met_percentage: number;
  latest_weight: number | null;
  weight_change: number | null;
  entries_count: number;
}

interface ProgressResponse {
  entries: ProgressEntry[];
  summary: ProgressSummary;
}

interface SaveProgressResponse {
  message: string;
  entry: ProgressEntry;
  summary: ProgressSummary;
}

export interface SaveProgressPayload {
  entry_date: string;
  weight: number | null;
  workouts_completed: number;
  calories_burned: number;
  goal_completed: boolean;
  notes?: string;
}

export const progressService = {
  getByClient: (userId: number) =>
    apiClient<ProgressResponse>(`client/${userId}/progress`, {
      method: "GET",
    }),

  saveEntry: (userId: number, payload: SaveProgressPayload) =>
    apiClient<SaveProgressResponse>(`client/${userId}/progress`, {
      method: "POST",
      body: payload,
    }),
};
