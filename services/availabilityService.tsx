import { apiClient } from "@/lib/api";

export interface AvailabilitySlot {
  availability_id?: number;
  day_of_week: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  start_time: string;  // "HH:MM" or "HH:MM:SS"
  end_time: string;
  is_available: boolean;
}

interface AvailabilityResponse {
  availability: AvailabilitySlot[];
}

interface MessageResponse {
  message: string;
}

export const availabilityService = {
  // Get coach availability (UC 9.3)
  get: (userId: number) =>
    apiClient<AvailabilityResponse>(`coach/${userId}/availability`, {
      method: "GET",
    }),

  // Set/update coach availability (UC 9.3)
  set: (userId: number, slots: Omit<AvailabilitySlot, "availability_id">[]) =>
    apiClient<MessageResponse>(`coach/${userId}/availability`, {
      method: "POST",
      body: { slots },
    }),
};