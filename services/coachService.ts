import { apiClient } from "@/lib/api";
import { CoachItem } from "@/types/CoachItem";

interface CoachesResponse {
  coaches: CoachItem[];
}

export interface PendingRegistration {
  coach_id: number; // reg_id from CoachRegistration
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  status: "pending";
  created_at: string;
}

interface PendingCoachesResponse {
  pending_coaches: PendingRegistration[];
}

interface MessageResponse {
  message: string;
}

export const coachService = {
  getAll: () =>
    apiClient<CoachesResponse>("admin/coaches", { method: "GET" }),

  getPending: () =>
    apiClient<PendingCoachesResponse>("admin/coaches/pending", { method: "GET" }),

  updateStatus: (coachId: number, action: string, reason?: string) =>
    apiClient<MessageResponse>(`admin/coaches/${coachId}/status`, {
      method: "PUT",
      body: { status: action, ...(reason ? { reason } : {}) },
    }),

  processRegistration: (regId: number, action: "approved" | "rejected", reason?: string) =>
    apiClient<MessageResponse>(`admin/coaches/${regId}/process`, {
      method: "PUT",
      body: {
        action,
        cost: 0,
        rejection_reason: action === "rejected" ? (reason ?? "Rejected by admin") : undefined,
      },
    }),

  getById: (coachId: number) =>
    apiClient<{ coach: CoachItem }>(`admin/coaches/${coachId}`, { method: "GET" }),
};