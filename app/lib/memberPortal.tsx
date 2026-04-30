"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import {
  clearAuthSession,
  fetchCurrentDashboard,
  fetchCurrentProfile,
  getStoredAuthSession,
  getStoredAuthToken,
  updateCurrentDashboard,
  updateCurrentProfile,
} from "@/app/lib/api";

export const WEEK_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export interface MemberProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  membership: string;
  coachName: string;
  pronouns: string;
  height: string;
  weight: string;
  goal: string;
  emergencyContact: string;
  bio: string;
  role?: string;
}

export interface DashboardSettings {
  workoutsCompleted: number;
  currentStreak: number;
  caloriesBurned: number;
  goalsMet: number;
  goalsTotal: number;
  weeklyWorkoutGoal: number;
  hydrationGoal: number;
  sleepGoal: number;
  focusArea: string;
  preferredSessionTime: string;
  mealFocus: string;
  trainingDays: WeekDay[];
  coachNote: string;
  nextSessionTitle: string;
  nextSessionDate: string;
  nextSessionFormat: string;
  recoveryFocus: string;
}

interface MemberPortalContextValue {
  profile: MemberProfile;
  dashboard: DashboardSettings;
  replaceProfile: (nextProfile: MemberProfile) => void;
  updateProfile: (patch: Partial<MemberProfile>) => void;
  replaceDashboard: (nextDashboard: DashboardSettings) => void;
  updateDashboard: (patch: Partial<DashboardSettings>) => void;
  saveProfile: (nextProfile: MemberProfile) => Promise<void>;
  saveDashboard: (nextDashboard: DashboardSettings) => Promise<void>;
  refreshPortal: () => Promise<void>;
  logout: () => void;
  displayName: string;
  initials: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string;
}

export const DEFAULT_PROFILE: MemberProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  membership: "Member Portal",
  coachName: "",
  pronouns: "",
  height: "",
  weight: "",
  goal: "",
  emergencyContact: "",
  bio: "",
  role: "client",
};

export const DEFAULT_DASHBOARD: DashboardSettings = {
  workoutsCompleted: 0,
  currentStreak: 0,
  caloriesBurned: 0,
  goalsMet: 0,
  goalsTotal: 0,
  weeklyWorkoutGoal: 0,
  hydrationGoal: 0,
  sleepGoal: 0,
  focusArea: "",
  preferredSessionTime: "",
  mealFocus: "",
  trainingDays: [],
  coachNote: "",
  nextSessionTitle: "",
  nextSessionDate: "",
  nextSessionFormat: "",
  recoveryFocus: "",
};

const MemberPortalContext = createContext<MemberPortalContextValue | null>(
  null,
);

function sanitizeTrainingDays(trainingDays: unknown): WeekDay[] {
  if (!Array.isArray(trainingDays)) {
    return [];
  }

  const safeDays = trainingDays.filter(
    (day): day is WeekDay =>
      typeof day === "string" && WEEK_DAYS.includes(day as WeekDay),
  );

  return safeDays;
}

function mergeProfile(savedProfile: unknown) {
  if (!savedProfile || typeof savedProfile !== "object") {
    return DEFAULT_PROFILE;
  }

  return {
    ...DEFAULT_PROFILE,
    ...(savedProfile as Partial<MemberProfile>),
  };
}

function mergeDashboard(savedDashboard: unknown) {
  if (!savedDashboard || typeof savedDashboard !== "object") {
    return DEFAULT_DASHBOARD;
  }

  const partialDashboard = savedDashboard as Partial<DashboardSettings>;

  return {
    ...DEFAULT_DASHBOARD,
    ...partialDashboard,
    trainingDays: sanitizeTrainingDays(partialDashboard.trainingDays),
  };
}

export function MemberPortalProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<MemberProfile>(DEFAULT_PROFILE);
  const [dashboard, setDashboard] =
    useState<DashboardSettings>(DEFAULT_DASHBOARD);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("client");

  async function refreshPortal() {
    let session = getStoredAuthSession();

    if (!session?.token) {
      try {
        const raw = window.localStorage.getItem("auth");
        const parsed = raw ? JSON.parse(raw) : null;
        const zustandToken = parsed?.token ?? null;
        const zustandUser = parsed?.user ?? null;
        if (zustandToken && zustandUser) {
          session = {
            token: zustandToken,
            user: {
              id: zustandUser.id,
              userId: zustandUser.id,
              firstName: zustandUser.first_name,
              lastName: zustandUser.last_name,
              name: `${zustandUser.first_name} ${zustandUser.last_name}`,
              email: zustandUser.email,
              role: zustandUser.role,
            },
          };
        }
      } catch {
        // ignore
      }
    }

    if (!session?.token) {
      setProfile(DEFAULT_PROFILE);
      setDashboard(DEFAULT_DASHBOARD);
      setIsAuthenticated(false);
      setUserRole("client");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [profileResponse, dashboardResponse] = await Promise.all([
        fetchCurrentProfile(session.token),
        fetchCurrentDashboard(session.token),
      ]);

      setProfile(mergeProfile(profileResponse.profile));
      setDashboard(mergeDashboard(dashboardResponse.dashboard));
      setUserRole(profileResponse.user.role);
      setIsAuthenticated(true);
    } catch {
      console.warn(
        "Could not fetch profile APIs. Falling back to session data.",
      );

      const user = session.user as any;

      setProfile(
        mergeProfile({
          firstName: user.firstName || user.first_name || "Coach",
          lastName: user.lastName || user.last_name || "",
          email: user.email,
          role: user.role,
        }),
      );
      setDashboard(DEFAULT_DASHBOARD);
      setUserRole(user.role || "client");
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshPortal();
  }, []);

  async function saveProfile(nextProfile: MemberProfile) {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error("You need to log in before saving your profile.");
    }

    const response = await updateCurrentProfile(token, nextProfile);
    setProfile(mergeProfile(response.profile));
  }

  async function saveDashboard(nextDashboard: DashboardSettings) {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error("You need to log in before saving your dashboard.");
    }

    const response = await updateCurrentDashboard(token, nextDashboard);
    setDashboard(mergeDashboard(response.dashboard));
  }

  function logout() {
    clearAuthSession();
    setProfile(DEFAULT_PROFILE);
    setDashboard(DEFAULT_DASHBOARD);
    setIsAuthenticated(false);
    setUserRole("client");
    window.location.assign("/");
  }

  const value: MemberPortalContextValue = {
    profile,
    dashboard,
    replaceProfile: setProfile,
    updateProfile: (patch) =>
      setProfile((current) => ({ ...current, ...patch })),
    replaceDashboard: (nextDashboard) =>
      setDashboard({
        ...nextDashboard,
        trainingDays: sanitizeTrainingDays(nextDashboard.trainingDays),
      }),
    updateDashboard: (patch) =>
      setDashboard((current) => ({
        ...current,
        ...patch,
        trainingDays: patch.trainingDays
          ? sanitizeTrainingDays(patch.trainingDays)
          : current.trainingDays,
      })),
    saveProfile,
    saveDashboard,
    refreshPortal,
    logout,
    displayName: `${profile.firstName} ${profile.lastName}`.trim(),
    initials:
      `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase(),
    isAuthenticated,
    isLoading,
    userRole,
  };

  return (
    <MemberPortalContext.Provider value={value}>
      {children}
    </MemberPortalContext.Provider>
  );
}

export function useMemberPortal() {
  const context = useContext(MemberPortalContext);

  if (!context) {
    throw new Error("useMemberPortal must be used within MemberPortalProvider");
  }

  return context;
}
