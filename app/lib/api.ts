"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5000/api";
const AUTH_STORAGE_KEY = "herahealth.auth";

export interface AuthUser {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
  Failed?: string;
  "Error:"?: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readJsonStorage<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

export function getStoredAuthSession() {
  return readJsonStorage<AuthSession>(AUTH_STORAGE_KEY);
}

export function getStoredAuthToken() {
  return getStoredAuthSession()?.token ?? null;
}

export function storeAuthSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getDashboardRouteForRole(role: string) {
  if (role === "admin") {
    return "/dashboards/admin";
  }

  if (role === "coach") {
    return "/dashboards/coach";
  }

  return "/dashboards/user";
}

async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as T & ApiErrorPayload;

  if (!response.ok) {
    const exactError = payload["Error:"] ? ` - ${payload["Error:"]}` : "";
    throw new Error((payload.Failed || payload.error || payload.message || "Request failed") + exactError);
  }

  return payload as T;
}

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthSessionLikeResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signupRequest(firstName: string, lastName: string, email: string, password: string) {
  // Auto-generate a unique username to bypass the backend's NULL check
  const uniqueUsername = `${firstName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}`;

  return apiRequest<AuthSessionLikeResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ 
      first_name: firstName, 
      last_name: lastName, 
      username: uniqueUsername, // Send the generated username
      email, 
      password 
    }),
  });
}

export async function fetchCurrentProfile(token: string) {
  const session = getStoredAuthSession();
  if (!session || !session.user) {
    throw new Error("No active session found.");
  }
  
  const userId = session.user.id || (session.user as any).user_id || (session.user as any).userId;

  // FIX 1: The Next.js Cache Buster. 
  // Adding cache: "no-store" and a timestamp URL parameter forces Next.js to fetch fresh DB data!
  const url = `/getusers?user_id=${userId}&t=${Date.now()}`;
  const response = await apiRequest<any[]>(url, { method: "GET", cache: "no-store" }, token);
  
  if (!response || response.length === 0) {
    throw new Error("User profile not found in database.");
  }

  const userRow = response[0];
  const isArray = Array.isArray(userRow);
  const dbWeight = isArray ? userRow[9] : userRow.weight;

  // FIX 2: Ensuring no null values crash the React inputs
  const dbProfile = {
    firstName: (isArray ? userRow[1] : userRow.first_name) || "",
    lastName: (isArray ? userRow[2] : userRow.last_name) || "",
    email: (isArray ? userRow[4] : userRow.email) || "",
    phone: (isArray ? userRow[11] : userRow.phone) || "",
    weight: dbWeight ? `${dbWeight} lbs` : "",
    role: (isArray ? userRow[6] : userRow.role) || "client",
    
    // UI Defaults
    city: "Jersey City, NJ",
    membership: "Member Portal",
    coachName: "Jordan Rivera",
    pronouns: "she/her",
    height: "5'8\"",
    goal: "Build lean muscle while improving recovery consistency.",
    emergencyContact: "Avery Chen · (555) 884-1102",
    bio: "Focused on strength, mobility, and sustainable routines that fit around grad school and work."
  };

  return {
    user: session.user,
    profile: dbProfile
  };
}

export async function updateCurrentProfile(token: string, profile: any) {
  const session = getStoredAuthSession();
  if (!session || !session.user) throw new Error("No active session found.");
  const userId = session.user.id || (session.user as any).user_id || (session.user as any).userId;

  // Map the frontend fields to the strict MySQL columns
  const backendPayload: Record<string, any> = {};

  if (profile.firstName !== undefined) backendPayload.first_name = profile.firstName;
  if (profile.lastName !== undefined) backendPayload.last_name = profile.lastName;
  if (profile.email !== undefined) backendPayload.email = profile.email;
  if (profile.phone !== undefined) backendPayload.phone = profile.phone;

  if (profile.weight !== undefined) {
    const numericWeight = parseFloat(String(profile.weight).replace(/[^0-9.]/g, ''));
    if (!isNaN(numericWeight)) {
      backendPayload.weight = numericWeight;
    }
  }

  // FIX 3: The Dual-Route Fallback Strategy
  try {
    // Attempt 1: Try hitting the new JWT route you added to auth_controller.py
    await apiRequest<any>("/auth/update", { 
      method: "PATCH", 
      body: JSON.stringify(backendPayload) 
    }, token);
    
  } catch (err) {
    // Attempt 2: If the new route returns 404, fallback to the original update_user.py route
    console.warn("Primary route failed, falling back to /customers/ route...");
    await apiRequest<any>(`/customers/${userId}`, { 
      method: "PATCH", 
      body: JSON.stringify(backendPayload) 
    }, token);
  }

  // Return the draft back to the UI to update the screen
  return { profile };
}

export async function fetchCurrentDashboard(token: string) {
  // MOCK: Prevents Promise.all from crashing since the backend lacks this route
  return { dashboard: {} } as CurrentDashboardResponse;
}

export async function updateCurrentDashboard<T>(token: string, dashboard: T) {
  // MOCK: Prevents crashing if they attempt to save dashboard settings
  return { dashboard: dashboard as any } as CurrentDashboardResponse;
}

interface AuthSessionLikeResponse {
  token: string;
  user: AuthUser;
  message: string;
}

interface CurrentProfileResponse {
  user: AuthUser;
  profile: Record<string, unknown>;
}

interface CurrentDashboardResponse {
  dashboard: Record<string, unknown>;
}

export interface CoachRecord {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_photo?: string;
  // Enhanced Demo Fields
  specialty: string;
  price: number;
  rating: number;
  bio: string;
}

export async function fetchCoaches(token: string): Promise<CoachRecord[]> {
  const response = await apiRequest<any[]>("/getusers", { method: "GET" }, token);
  
  const parsedUsers = response.map((user: any) => {
    const isArray = Array.isArray(user);
    const userId = isArray ? user[0] : user.user_id;
    
    const specialties = ["Strength Training", "Nutrition", "Yoga", "Endurance", "CrossFit"];
    const prices = [50, 75, 100, 150, 200];
    const ratings = [4.2, 4.5, 4.8, 4.9, 5.0];

    return {
      user_id: userId,
      first_name: isArray ? user[1] : user.first_name,
      last_name: isArray ? user[2] : user.last_name,
      email: isArray ? user[4] : user.email,
      role: isArray ? user[6] : user.role,
      profile_photo: isArray ? user[12] : user.profile_photo,
      specialty: specialties[userId % specialties.length],
      price: prices[userId % prices.length],
      rating: ratings[userId % ratings.length],
      bio: "Dedicated to helping you reach your best self through structured and personalized programming."
    };
  });

  return parsedUsers.filter((u) => u.role === "coach");
}

export async function fetchCoachById(token: string, id: number): Promise<CoachRecord> {
  // Use the existing backend endpoint that accepts a user_id parameter
  const response = await apiRequest<any[]>(`/getusers?user_id=${id}`, { method: "GET" }, token);
  
  if (!response || response.length === 0) {
    throw new Error("Coach not found");
  }

  const user = response[0];
  const isArray = Array.isArray(user);
  const userId = isArray ? user[0] : user.user_id;

  // Keep deterministic mock data consistent with the discovery page
  const specialties = ["Strength Training", "Nutrition", "Yoga", "Endurance", "CrossFit"];
  const prices = [50, 75, 100, 150, 200];
  const ratings = [4.2, 4.5, 4.8, 4.9, 5.0];

  return {
    user_id: userId,
    first_name: isArray ? user[1] : user.first_name,
    last_name: isArray ? user[2] : user.last_name,
    email: isArray ? user[4] : user.email,
    role: isArray ? user[6] : user.role,
    profile_photo: isArray ? user[12] : user.profile_photo,
    specialty: specialties[userId % specialties.length],
    price: prices[userId % prices.length],
    rating: ratings[userId % ratings.length],
    bio: "Dedicated to helping you reach your best self through structured and personalized programming. I have years of experience in the fitness industry, helping dozens of clients achieve their dream physiques and improve their overall health."
  };
}

export function sendCoachingRequest(token: string, coachId: number, message: string) {
  return apiRequest(`/client/request-coach/${coachId}`, { // Passing the ID dynamically into the URL
    method: "POST",
    body: JSON.stringify({
      message: message
    }),
  }, token);
}


export function deleteAccountRequest(token: string, password?: string) {
  return apiRequest("/auth/delete", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  }, token);
}

export function applyForCoachRequest(token: string, payload: { specialty: string, experience_years: number, certifications: string }) {
  return apiRequest("/coach/apply", { 
    method: "POST",
    body: JSON.stringify({
      specialty: payload.specialty,
      qualifications: `${payload.experience_years} years exp. Certs: ${payload.certifications}`, // Merging them to match the backend 'qualifications' column
      document_links: "" // Leaving empty as there's no upload field in the UI yet
    })
  }, token);
}

export function fakePasswordResetRequest(email: string) {
  // Skeleton API call for UC 1.11
  return new Promise((resolve) => setTimeout(resolve, 1500));
}

export function logStrengthRequest(token: string, payload: any) {
  return apiRequest("/logs/strength", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function logCardioRequest(token: string, payload: any) {
  return apiRequest("/logs/cardio", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function logDailyMetricsRequest(token: string, payload: any) {
  return apiRequest("/logs/steps-calories", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function fetchActivityLogs(token: string) {
  return apiRequest("/logs", {
    method: "GET",
  }, token);
}

export function deleteActivityLog(token: string, logId: number) {
  return apiRequest(`/logs/${logId}`, {
    method: "DELETE",
  }, token);
}

// --- NUTRITION & MEAL PLAN API (SKELETONS) ---

export function fetchMealPlansRequest(token: string) {
  // Skeleton for fetching a user's assigned meal plans
  return apiRequest("/mealplans/my-plans", {
    method: "GET",
  }, token);
}

export function markMealCompletedRequest(token: string, mealId: number, isCompleted: boolean) {
  // Skeleton for marking a specific meal as eaten
  return apiRequest(`/mealplans/meals/${mealId}/complete`, {
    method: "POST",
    body: JSON.stringify({ completed: isCompleted })
  }, token);
}