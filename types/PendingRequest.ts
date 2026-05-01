export interface PendingRequest {
  request_id: number;
  coach_id: number;
  coach_name: string;
  coach_specialization: string | null;
  message: string | null;
  requested_at: string;
}