import { apiClient } from "@/lib/api";

export interface AvailabilitySlot {
  availability_id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const availabilityService = {
  getByUser: (userId: number) =>
    apiClient<{ availability: AvailabilitySlot[] }>(`coach/${userId}/availability`, {
      method: "GET",
    }),

  set: (userId: number, slots: AvailabilitySlot[]) =>
    apiClient<{ message: string }>(`coach/${userId}/availability`, {
      method: "POST",
      body: { slots },
    }),
};