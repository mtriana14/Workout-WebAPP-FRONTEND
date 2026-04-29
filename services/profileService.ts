import { apiClient } from "@/lib/api";

type UserRow = [
  number,
  string,
  string,
  string | null,
  string,
  string | null,
  string,
  boolean,
  string | null,
  number | null,
  number | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

export interface UserProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone: string | null;
  profile_photo: string | null;
}

export interface CoachProfile extends UserProfile {
  coach_id: number;
  specialization: "fitness" | "nutrition" | "both";
  certifications: string | null;
  experience_years: number | null;
  gym: string | null;
  cost: number;
  hourly_rate: number | null;
  bio: string | null;
  status: string;
}

function normalizeUser(row: UserRow | Record<string, unknown>): UserProfile {
  if (Array.isArray(row)) {
    return {
      id: Number(row[0]),
      user_id: Number(row[0]),
      first_name: String(row[1] ?? ""),
      last_name: String(row[2] ?? ""),
      email: String(row[4] ?? ""),
      role: String(row[6] ?? "client"),
      phone: row[11] ? String(row[11]) : null,
      profile_photo: row[12] ? String(row[12]) : null,
    };
  }

  const userId = Number(row.user_id ?? row.id ?? 0);
  return {
    id: userId,
    user_id: userId,
    first_name: String(row.first_name ?? ""),
    last_name: String(row.last_name ?? ""),
    email: String(row.email ?? ""),
    role: String(row.role ?? "client"),
    phone: row.phone ? String(row.phone) : null,
    profile_photo: row.profile_photo ? String(row.profile_photo) : null,
  };
}

export const profileService = {
  getUser: async (userId: number) => {
    const users = await apiClient<Array<UserRow | Record<string, unknown>>>(`getusers?user_id=${userId}`, {
      method: "GET",
      public: true,
    });
    return { user: normalizeUser(users[0]) };
  },

  updateUser: async (_userId: number, payload: Partial<UserProfile>) => {
    const response = await apiClient<{ Success?: string; message?: string }>("auth/update", {
      method: "PATCH",
      body: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
      },
    });
    return { message: response.Success ?? response.message ?? "Profile updated" };
  },

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("profile_photo", file);
    return apiClient<{ Success?: string; profile_photo?: string }>("auth/update/upload_pfp", {
      method: "PATCH",
      body: formData,
    });
  },

  getCoach: async (userId: number) => {
    const { user } = await profileService.getUser(userId);
    let coachId = 0;

    try {
      const dashboard = await apiClient<{ coach_id: number }>("coach/dashboard", { method: "GET" });
      coachId = dashboard.coach_id;
    } catch {
      coachId = 0;
    }

    let coachDetails: Partial<CoachProfile> = {};
    if (coachId) {
      try {
        const response = await apiClient<{ coach: Partial<CoachProfile> & { hourly_rate?: number | null } }>(
          `client/coaches/${coachId}`,
          { method: "GET" },
        );
        coachDetails = response.coach;
      } catch {
        coachDetails = {};
      }
    }

    return {
      profile: {
        ...user,
        coach_id: coachId || Number(coachDetails.coach_id ?? 0),
        specialization: (coachDetails.specialization as CoachProfile["specialization"]) ?? "fitness",
        certifications: coachDetails.certifications ?? null,
        experience_years: coachDetails.experience_years ?? null,
        gym: coachDetails.gym ?? null,
        cost: Number(coachDetails.cost ?? coachDetails.hourly_rate ?? 149),
        hourly_rate: coachDetails.hourly_rate ?? null,
        bio: coachDetails.bio ?? null,
        status: coachDetails.status ?? "active",
      },
    };
  },

  updateCoach: async (_userId: number, payload: Partial<CoachProfile>) => {
    const response = await apiClient<{ Success?: string }>("auth/update/update_coach", {
      method: "PATCH",
      body: {
        specialization: payload.specialization,
        certifications: payload.certifications,
        experience_years: payload.experience_years,
        gym: payload.gym,
        cost: payload.cost,
        hourly_rate: payload.hourly_rate,
        bio: payload.bio,
      },
    });
    return { message: response.Success ?? "Coach updated" };
  },

  resetPassword: (payload: { email: string; new_password: string }) =>
    apiClient<{ Success?: string; Failed?: string }>("password_reset/forgot", {
      method: "PATCH",
      body: { email: payload.email, password: payload.new_password },
      public: true,
    }),

  updatePassword: (payload: { current_password: string; new_password: string }) =>
    apiClient<{ Success?: string }>("password_reset", {
      method: "PATCH",
      body: {
        old_password: payload.current_password,
        new_password: payload.new_password,
      },
    }),
};
