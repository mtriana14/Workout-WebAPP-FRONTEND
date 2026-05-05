import { apiClient } from "@/lib/api";
import { UserItem, UserRequest } from "@/types/UserItem";

export const userService = {
  getAll: async () => {
    return await apiClient<UserRequest[]>("users");
  },
};
