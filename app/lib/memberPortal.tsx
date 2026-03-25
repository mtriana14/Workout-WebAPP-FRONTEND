"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
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
  resetPortal: () => void;
  displayName: string;
  initials: string;
}

interface PersistedPortalState {
  profile?: Partial<MemberProfile>;
  dashboard?: Partial<DashboardSettings>;
}

const STORAGE_KEY = "herahealth.member-portal";

export const DEFAULT_PROFILE: MemberProfile = {
  firstName: "Sam",
  lastName: "Chen",
  email: "user@herahealth.com",
  phone: "(555) 014-2288",
  city: "Jersey City, NJ",
  membership: "Member Portal",
  coachName: "Jordan Rivera",
  pronouns: "she/her",
  height: "5'8\"",
  weight: "148 lbs",
  goal: "Build lean muscle while improving recovery consistency.",
  emergencyContact: "Avery Chen · (555) 884-1102",
  bio: "Focused on strength, mobility, and sustainable routines that fit around grad school and work.",
};

export const DEFAULT_DASHBOARD: DashboardSettings = {
  workoutsCompleted: 48,
  currentStreak: 12,
  caloriesBurned: 9340,
  goalsMet: 7,
  goalsTotal: 8,
  weeklyWorkoutGoal: 4,
  hydrationGoal: 96,
  sleepGoal: 8,
  focusArea: "Build lean muscle with stronger lower-body sessions.",
  preferredSessionTime: "Early mornings before 9 AM",
  mealFocus: "More protein at breakfast and post-workout meals.",
  trainingDays: ["Mon", "Wed", "Fri", "Sat"],
  coachNote:
    "Keep deadlift volume moderate this week and stay consistent with mobility work after each lift.",
  nextSessionTitle: "Lower Body Strength Check-In",
  nextSessionDate: "Thu, Mar 27 · 7:30 AM",
  nextSessionFormat: "Virtual video session",
  recoveryFocus: "8 hours of sleep and 10 minutes of mobility after each workout.",
};

const MemberPortalContext = createContext<MemberPortalContextValue | null>(null);

function mergePortalState(saved: PersistedPortalState | null) {
  return {
    profile: {
      ...DEFAULT_PROFILE,
      ...(saved?.profile ?? {}),
    },
    dashboard: {
      ...DEFAULT_DASHBOARD,
      ...(saved?.dashboard ?? {}),
      trainingDays: sanitizeTrainingDays(saved?.dashboard?.trainingDays),
    },
  };
}

function sanitizeTrainingDays(trainingDays: unknown): WeekDay[] {
  if (!Array.isArray(trainingDays)) {
    return DEFAULT_DASHBOARD.trainingDays;
  }

  const safeDays = trainingDays.filter((day): day is WeekDay =>
    typeof day === "string" && WEEK_DAYS.includes(day as WeekDay),
  );

  return safeDays.length > 0 ? safeDays : DEFAULT_DASHBOARD.trainingDays;
}

export function MemberPortalProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<MemberProfile>(DEFAULT_PROFILE);
  const [dashboard, setDashboard] = useState<DashboardSettings>(DEFAULT_DASHBOARD);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistedPortalState) : null;
      const merged = mergePortalState(parsed);
      setProfile(merged.profile);
      setDashboard(merged.dashboard);
    } catch {
      setProfile(DEFAULT_PROFILE);
      setDashboard(DEFAULT_DASHBOARD);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile,
        dashboard,
      }),
    );
  }, [dashboard, isHydrated, profile]);

  const value: MemberPortalContextValue = {
    profile,
    dashboard,
    replaceProfile: setProfile,
    updateProfile: (patch) => setProfile((current) => ({ ...current, ...patch })),
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
    resetPortal: () => {
      setProfile(DEFAULT_PROFILE);
      setDashboard(DEFAULT_DASHBOARD);
    },
    displayName: `${profile.firstName} ${profile.lastName}`.trim(),
    initials: `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase(),
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
