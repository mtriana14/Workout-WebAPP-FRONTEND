import { apiClient } from "@/lib/api";
import { PendingRequest } from "@/types/PendingRequest";

// ==================== TYPES ====================

export interface CoachInfo {
  coach_id: number;
  user_id: number;
  name: string;
  email: string | null;
  specialization: string | null;
  experience_years: number | null;
  bio: string | null;
  hourly_rate: number | null;
  certifications?: string | null;
  availability: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
}

export interface MyCoach {
  coach_id: number;
  name: string;
  email: string | null;
  specialization: string | null;
  since: string;
}

export interface CoachRequest {
  request_id: number;
  coach_id: number;
  coach_name: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at: string | null;
}

export interface ClientWorkoutPlan {
  plan_id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "completed";
  coach_name: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMealPlan {
  meal_plan_id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "completed";
  coach_name: string;
  created_at: string;
  updated_at: string;
}

// ==================== SERVICE ====================

export const clientDashboardService = {
  // Get all available coaches
  getCoaches: () =>
    apiClient<{ coaches: CoachInfo[] }>("client/coaches", {
      method: "GET",
    }),

  // Get coach details
  getCoachDetails: (coachId: number) =>
    apiClient<{ coach: CoachInfo }>("client/coaches/" + coachId, {
      method: "GET",
    }),

  // Send request to coach
  sendRequest: (userId: number, coachId: number, message?: string) =>
    apiClient<{ message: string; request_id: number }>(
      `client/${userId}/requests`,
      {
        method: "POST",
        body: { coach_id: coachId, message },
      },
    ),

  // Get my requests
  getMyRequests: (userId: number) =>
    apiClient<{ requests: CoachRequest[] }>(`client/${userId}/requests`, {
      method: "GET",
    }),

  // Get my active coach
  getMyCoach: (userId: number) =>
    apiClient<{ coach: MyCoach | null }>(`client/${userId}/my-coach`, {
      method: "GET",
    }),

  // Get my workout plans
  getMyWorkoutPlans: (userId: number) =>
    apiClient<{ workout_plans: ClientWorkoutPlan[] }>(
      `client/${userId}/workout-plans`,
      {
        method: "GET",
      },
    ),

  // Get my meal plans
  getMyMealPlans: (userId: number) =>
    apiClient<{ meal_plans: ClientMealPlan[] }>(`client/${userId}/meal-plans`, {
      method: "GET",
    }),

  // Get my active workout plans
  // Get pending coaching request
  getPendingRequest: (userId: number) =>
    apiClient<{ pending_request: PendingRequest | null }>(
      `client/${userId}/pending-request`,
      {
        method: "GET",
      },
    ),
};
