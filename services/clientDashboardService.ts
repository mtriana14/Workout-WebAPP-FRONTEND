import { apiClient } from "@/lib/api";

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
  user_id: number;
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
  source?: "coach" | "client";
}

export interface ClientMealPlan {
  meal_plan_id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive" | "completed";
  coach_name: string;
  created_at: string;
  updated_at: string;
  source?: "coach" | "client";
}

// ==================== SERVICE ====================

type PlanStatus = "active" | "inactive" | "completed";

function canUseLocalStorage() {
  return typeof window !== "undefined";
}

function workoutKey(userId: number) {
  return `herahealth.clientWorkouts.${userId}`;
}

function mealKey(userId: number) {
  return `herahealth.clientMeals.${userId}`;
}

function readLocal<T>(key: string): T[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, plans: T[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(plans));
}

function mergeById<T extends { source?: "coach" | "client" }>(
  remotePlans: T[],
  localPlans: T[],
  idFor: (plan: T) => number,
) {
  const plans = new Map<number, T>();

  for (const plan of remotePlans) {
    plans.set(idFor(plan), { ...plan, source: plan.source ?? "coach" });
  }

  for (const plan of localPlans) {
    plans.set(idFor(plan), { ...plan, source: "client" });
  }

  return Array.from(plans.values()).sort((a, b) => {
    const aDate = "updated_at" in a ? String(a.updated_at) : "";
    const bDate = "updated_at" in b ? String(b.updated_at) : "";
    return bDate.localeCompare(aDate);
  });
}

function getLocalWorkoutPlans(userId: number) {
  return readLocal<ClientWorkoutPlan>(workoutKey(userId));
}

function setLocalWorkoutPlans(userId: number, plans: ClientWorkoutPlan[]) {
  writeLocal(workoutKey(userId), plans);
}

function getLocalMealPlans(userId: number) {
  return readLocal<ClientMealPlan>(mealKey(userId));
}

function setLocalMealPlans(userId: number, plans: ClientMealPlan[]) {
  writeLocal(mealKey(userId), plans);
}

export const clientDashboardService = {
  // Get all available coaches
  getCoaches: () =>
    apiClient<{ coaches: CoachInfo[] }>("client/coaches", {
      method: "GET",
    }),

  // Dismiss current coach
  dismissCoach: (coachId: number) =>
    apiClient<{ message: string }>(`client/dismiss-coach/${coachId}`, {
      method: "PUT",
    }),

  // Get coach details
  getCoachDetails: (coachId: number) =>
    apiClient<{ coach: CoachInfo }>("client/coaches/" + coachId, {
      method: "GET",
    }),

  // Send request to coach
  sendRequest: (userId: number, coachId: number, message?: string) =>
    apiClient<{ message: string; request_id: number }>(`client/${userId}/requests`, {
      method: "POST",
      body: { coach_id: coachId, message },
    }),

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
  getMyWorkoutPlans: async (userId: number) => {
    const localPlans = getLocalWorkoutPlans(userId);

    try {
      const response = await apiClient<{ workout_plans: ClientWorkoutPlan[] }>(`client/${userId}/workout-plans`, {
        method: "GET",
      });

      return {
        workout_plans: mergeById(
          response.workout_plans,
          localPlans,
          (plan) => plan.plan_id,
        ),
      };
    } catch {
      return { workout_plans: localPlans };
    }
  },

  // Get my meal plans
  getMyMealPlans: async (userId: number) => {
    const localPlans = getLocalMealPlans(userId);

    try {
      const response = await apiClient<{ meal_plans: ClientMealPlan[] }>(`client/${userId}/meal-plans`, {
        method: "GET",
      });

      return {
        meal_plans: mergeById(
          response.meal_plans,
          localPlans,
          (plan) => plan.meal_plan_id,
        ),
      };
    } catch {
      return { meal_plans: localPlans };
    }
  },

  createMyWorkoutPlan: (userId: number, data: { name: string; description?: string; status?: PlanStatus }) => {
    const timestamp = new Date().toISOString();
    const plan: ClientWorkoutPlan = {
      plan_id: Date.now(),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status: data.status ?? "active",
      coach_name: "Created by you",
      created_at: timestamp,
      updated_at: timestamp,
      source: "client",
    };
    setLocalWorkoutPlans(userId, [plan, ...getLocalWorkoutPlans(userId)]);
    return plan;
  },

  updateMyWorkoutPlan: (userId: number, planId: number, data: Partial<Pick<ClientWorkoutPlan, "name" | "description" | "status">>) => {
    const plans = getLocalWorkoutPlans(userId).map((plan) =>
      plan.plan_id === planId
        ? {
          ...plan,
          ...data,
          description: data.description === undefined ? plan.description : data.description,
          updated_at: new Date().toISOString(),
        }
        : plan,
    );
    setLocalWorkoutPlans(userId, plans);
    return plans.find((plan) => plan.plan_id === planId) ?? null;
  },

  deleteMyWorkoutPlan: (userId: number, planId: number) => {
    const plans = getLocalWorkoutPlans(userId).filter((plan) => plan.plan_id !== planId);
    setLocalWorkoutPlans(userId, plans);
    return plans;
  },

  createMyMealPlan: (userId: number, data: { name: string; description?: string; status?: PlanStatus }) => {
    const timestamp = new Date().toISOString();
    const plan: ClientMealPlan = {
      meal_plan_id: Date.now(),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status: data.status ?? "active",
      coach_name: "Created by you",
      created_at: timestamp,
      updated_at: timestamp,
      source: "client",
    };
    setLocalMealPlans(userId, [plan, ...getLocalMealPlans(userId)]);
    return plan;
  },

  updateMyMealPlan: (userId: number, planId: number, data: Partial<Pick<ClientMealPlan, "name" | "description" | "status">>) => {
    const plans = getLocalMealPlans(userId).map((plan) =>
      plan.meal_plan_id === planId
        ? {
          ...plan,
          ...data,
          description: data.description === undefined ? plan.description : data.description,
          updated_at: new Date().toISOString(),
        }
        : plan,
    );
    setLocalMealPlans(userId, plans);
    return plans.find((plan) => plan.meal_plan_id === planId) ?? null;
  },

  deleteMyMealPlan: (userId: number, planId: number) => {
    const plans = getLocalMealPlans(userId).filter((plan) => plan.meal_plan_id !== planId);
    setLocalMealPlans(userId, plans);
    return plans;
  },
};
