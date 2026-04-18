import { LoginCredentials, LoginResponse } from "@/types/auth";
import { apiClient } from "@/lib/api";

 

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient<LoginResponse>("auth/login", {
      method: "POST",
      body:   credentials,
      public: true, // no necesita token
    }),
};