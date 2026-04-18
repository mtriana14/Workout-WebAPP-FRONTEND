 import { apiClient } from "@/lib/api";

export interface Exercise {
  e_id: number;
  name: string;
  description: string | null;
  equipment_type: "barbell" | "dumbbell" | "machine" | "bodyweight" | "cables" | "bands" | "other";
  muscle_group: "chest" | "back" | "shoulders" | "arms" | "legs" | "glutes" | "core" | "full_body" | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string | null;
  video_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface ExercisesResponse {
  exercises: Exercise[];
}

interface ExerciseResponse {
  exercise: Exercise;
}

interface MessageResponse {
  message: string;
}

export interface CreateExerciseData {
  name: string;
  description?: string;
  equipment_type?: string;
  muscle_group?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  instructions?: string;
  video_url?: string;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {
  is_active?: boolean;
}

export const exerciseService = {
  // Get all exercises
  getAll: () =>
    apiClient<ExercisesResponse>("admin/exercises", {
      method: "GET",
    }),

  // Get single exercise
  getById: (exerciseId: number) =>
    apiClient<ExerciseResponse>(`admin/exercises/${exerciseId}`, {
      method: "GET",
    }),

  // Create new exercise
  create: (data: CreateExerciseData) =>
    apiClient<ExerciseResponse>("admin/exercises", {
      method: "POST",
      body: data,
    }),

  // Update exercise
  update: (exerciseId: number, data: UpdateExerciseData) =>
    apiClient<ExerciseResponse>(`admin/exercises/${exerciseId}`, {
      method: "PUT",
      body: data,
    }),

  // Delete exercise
  delete: (exerciseId: number) =>
    apiClient<MessageResponse>(`admin/exercises/${exerciseId}`, {
      method: "DELETE",
    }),
};