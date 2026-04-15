import { apiClient } from "@/lib/api";
import { UserItem } from "@/types/UserItem";

export const userService = {
  getAll: async () => {
    return await apiClient<UserItem[]>("users");
  },
};
