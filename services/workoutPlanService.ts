import { apiClient } from "@/lib/api";

export interface WorkoutPlan {
  plan_id: number;
  user_id: number;
  client_name?: string;
  coach_id: number;
  name: string;
  description: string;
  status: "active" | "inactive" | "completed";
  created_at: string;
  updated_at: string;
}

interface WorkoutPlansResponse {
  workout_plans: WorkoutPlan[];
}

interface MessageResponse {
  message: string;
  plan_id?: number;
}

export const workoutPlanService = {
  // Get all workout plans for coach
  getAll: (userId: number) =>
    apiClient<WorkoutPlansResponse>(`coach/${userId}/workout-plans`, {
      method: "GET",
    }),

  // Get workout plans for specific client
  getByClient: (userId: number, clientId: number) =>
    apiClient<WorkoutPlansResponse>(`coach/${userId}/clients/${clientId}/workout-plans`, {
      method: "GET",
    }),

  // Create new workout plan
  create: (userId: number, data: { client_id: number; name: string; description?: string }) =>
    apiClient<MessageResponse>(`coach/${userId}/workout-plans`, {
      method: "POST",
      body: data,
    }),

  // Update workout plan
  update: (userId: number, planId: number, data: { name?: string; description?: string; status?: string }) =>
    apiClient<MessageResponse>(`coach/${userId}/workout-plans/${planId}`, {
      method: "PUT",
      body: data,
    }),

  // Delete workout plan
  delete: (userId: number, planId: number) =>
    apiClient<MessageResponse>(`coach/${userId}/workout-plans/${planId}`, {
      method: "DELETE",
    }),
};