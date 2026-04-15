import { apiClient } from "@/lib/api";
import { CoachItem } from "@/types/CoachItem";

interface CoachesResponse {
  coaches: CoachItem[];
}

interface PendingCoachesResponse {
  pending_coaches: CoachItem[];
}

interface MessageResponse {
  message: string;
}

export const coachService = {
  // Get all coaches (admin view)
  getAll: () =>
    apiClient<CoachesResponse>("admin/coaches", {
      method: "GET",
    }),

  // Get pending coach registrations (UC 10.2)
  getPending: () =>
    apiClient<PendingCoachesResponse>("admin/coaches/pending", {
      method: "GET",
    }),

  // Update coach status (UC 10.2 & 10.3)
  updateStatus: (coachId: number, action: string) =>
    apiClient<MessageResponse>(`admin/coaches/${coachId}/status`, {
      method: "PUT",
      body: { status: action },
    }),

  // Get single coach details
  getById: (coachId: number) =>
    apiClient<{ coach: CoachItem }>(`admin/coaches/${coachId}`, {
      method: "GET",
    }),
};