import { apiClient } from "@/lib/api";

export interface ClientRequest {
  request_id: number;
  client_id: number;
  client_name?: string;
  client_email?: string;
  coach_id: number;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  responded_at: string | null;
  created_at: string;
}

interface RequestsResponse {
  requests: ClientRequest[];
}

interface MessageResponse {
  message: string;
}

export const clientRequestService = {
  // Get pending requests for a coach (UC 9.4)
  getPending: (coachId: number) =>
    apiClient<RequestsResponse>(`coach/${coachId}/requests`, {
      method: "GET",
    }),

  // Get all requests for a coach (all statuses)
  getAll: (coachId: number) =>
    apiClient<RequestsResponse>(`coach/${coachId}/requests`, {
      method: "GET",
    }),

  // Accept or decline a request (UC 9.4)
  respond: (requestId: number, action: "accepted" | "declined") =>
    apiClient<MessageResponse>(`coach/requests/${requestId}/respond`, {
      method: "PUT",
      body: { action },
    }),
}; 