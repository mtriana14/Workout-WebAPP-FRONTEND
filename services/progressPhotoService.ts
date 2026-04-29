import { apiClient } from "@/lib/api";

export interface ProgressPhoto {
  photo_id: number;
  user_id: number;
  file_path: string;
  label: "before" | "progress" | "after";
  caption: string | null;
  weight_at_time: number | null;
  taken_on: string | null;
  created_at: string | null;
}

export const progressPhotoService = {
  getMine: () =>
    apiClient<{ total: number; photos: ProgressPhoto[] }>("progress-photos", {
      method: "GET",
    }),

  upload: (payload: {
    photo: File;
    label: "before" | "progress" | "after";
    caption?: string;
    weight?: string;
    taken_on?: string;
  }) => {
    const formData = new FormData();
    formData.append("photo", payload.photo);
    formData.append("label", payload.label);
    if (payload.caption) formData.append("caption", payload.caption);
    if (payload.weight) formData.append("weight", payload.weight);
    if (payload.taken_on) formData.append("taken_on", payload.taken_on);

    return apiClient<{ message: string; photo: ProgressPhoto }>("progress-photos", {
      method: "POST",
      body: formData,
    });
  },

  delete: (photoId: number) =>
    apiClient<{ message: string }>(`progress-photos/${photoId}`, {
      method: "DELETE",
    }),
};
