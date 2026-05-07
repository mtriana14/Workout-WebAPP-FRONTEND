import { apiClient } from "@/lib/api";
import { UserItem } from "@/types/UserItem";

export const userService = {
  getAll: async () => {
    return await apiClient<UserItem[]>("users");
  },

  updateStatus: (userId: number, isActive: boolean) =>
    apiClient<{ message: string }>(`admin/users/${userId}/status`, {
      method: "PUT",
      body: { is_active: isActive },
    }),
};
