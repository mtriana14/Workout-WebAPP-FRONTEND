import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "../types/auth";
 
interface AuthState {
  token: string | null;
  user:  AuthUser | null;
  hasHydrated: boolean;
  setAuth:         (token: string, user: AuthUser) => void;
  clearAuth:       () => void;
  setHasHydrated:  (hasHydrated: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user:  null,
      hasHydrated: false,
      setAuth:         (token, user) => set({ token, user, hasHydrated: true }),
      clearAuth:       () => set({ token: null, user: null }),
      setHasHydrated:  (hasHydrated) => set({ hasHydrated }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
