import { apiClient } from "@/lib/api";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  getAll: (userId: number) =>
    apiClient<{ notifications: AppNotification[] }>(`notifications/user/${userId}`, {
      method: "GET",
    }),

  getUnread: (userId: number) =>
    apiClient<{ notifications: AppNotification[]; unread_count: number }>(
      `notifications/user/${userId}/unread`,
      { method: "GET" },
    ),

  markRead: (notificationId: number) =>
    apiClient<{ message: string }>(`notifications/${notificationId}/read`, {
      method: "PUT",
    }),

  markAllRead: (userId: number) =>
    apiClient<{ message: string }>(`notifications/user/${userId}/read-all`, {
      method: "PUT",
    }),

  delete: (notificationId: number) =>
    apiClient<{ message: string }>(`notifications/${notificationId}`, {
      method: "DELETE",
    }),
};
