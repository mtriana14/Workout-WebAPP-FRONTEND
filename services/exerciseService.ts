import { apiClient } from "@/lib/api";

export interface Exercise {
  e_id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  created_at: string;
  updated_at?: string;
  equipment_type?: string;
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
  description: string;
  muscle_group: string;
  equipment?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  equipment_type?: string;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {}

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