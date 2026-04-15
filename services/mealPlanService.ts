import { apiClient } from "@/lib/api";

export interface MealPlan {
  meal_plan_id: number;
  user_id: number;
  client_name?: string;
  coach_id: number;
  name: string;
  description: string;
  status: "active" | "inactive" | "completed";
  created_at: string;
  updated_at: string;
}

interface MealPlansResponse {
  meal_plans: MealPlan[];
}

interface MessageResponse {
  message: string;
  meal_plan_id?: number;
}

export const mealPlanService = {
  // Get all meal plans for coach
  getAll: (userId: number) =>
    apiClient<MealPlansResponse>(`coach/${userId}/meal-plans`, {
      method: "GET",
    }),

  // Get meal plans for specific client
  getByClient: (userId: number, clientId: number) =>
    apiClient<MealPlansResponse>(`coach/${userId}/clients/${clientId}/meal-plans`, {
      method: "GET",
    }),

  // Create new meal plan
  create: (userId: number, data: { client_id: number; name: string; description?: string }) =>
    apiClient<MessageResponse>(`coach/${userId}/meal-plans`, {
      method: "POST",
      body: data,
    }),

  // Update meal plan
  update: (userId: number, planId: number, data: { name?: string; description?: string; status?: string }) =>
    apiClient<MessageResponse>(`coach/${userId}/meal-plans/${planId}`, {
      method: "PUT",
      body: data,
    }),

  // Delete meal plan
  delete: (userId: number, planId: number) =>
    apiClient<MessageResponse>(`coach/${userId}/meal-plans/${planId}`, {
      method: "DELETE",
    }),
};