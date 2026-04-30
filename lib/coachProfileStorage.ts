import type { CoachProfile } from "@/services/profileService";

const COACH_PROFILE_PREFIX = "herahealth.coachProfile.";

export type StoredCoachProfile = Partial<CoachProfile> & {
  profile_photo?: string | null;
};

function keyForUser(userId?: number | string | null) {
  return userId ? `${COACH_PROFILE_PREFIX}${userId}` : null;
}

export function getStoredCoachProfile(userId?: number | string | null): StoredCoachProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = keyForUser(userId);
  if (!key) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as StoredCoachProfile) : null;
  } catch {
    return null;
  }
}

export function setStoredCoachProfile(userId: number | string, profile: StoredCoachProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${COACH_PROFILE_PREFIX}${userId}`, JSON.stringify(profile));
}
