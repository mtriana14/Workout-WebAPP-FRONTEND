import { apiClient } from "@/lib/api";

export interface CoachReview {
  review_id: number;
  user_id: number;
  coach_id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
}

export const reviewService = {
  create: (payload: { coach_id: number; rating: number; comment: string }) =>
    apiClient<{ message: string; review: CoachReview }>(`coaches/${payload.coach_id}/reviews`, {
      method: "POST",
      body: {
        rating: payload.rating,
        comment: payload.comment,
      },
    }),

  getByCoach: (coachId: number) =>
    apiClient<{ reviews: CoachReview[]; avg_rating: number | null; total: number }>(
      `coaches/${coachId}/reviews`,
      { method: "GET" },
    ),
};
