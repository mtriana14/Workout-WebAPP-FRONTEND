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
    throw new Error(payload.error || payload.message || "Request failed");
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

export function fetchCurrentProfile(token: string) {
  return apiRequest<CurrentProfileResponse>("/users/me", {}, token);
}

export function updateCurrentProfile<T>(token: string, profile: T) {
  // 1. Automatically grab the session to find the user ID
  const session = getStoredAuthSession();
  
  if (!session || !session.user) {
    throw new Error("Cannot update profile: No active session found.");
  }

  // 2. Safely extract the ID regardless of case-formatting
  const userId = session.user.id || (session.user as any).user_id || (session.user as any).userId;

  // 3. Hit the correct backend route!
  return apiRequest<CurrentProfileResponse>(
    `/customers/${userId}`,
    {
      method: "PATCH",
      body: JSON.stringify(profile),
    },
    token,
  );
}

export function fetchCurrentDashboard(token: string) {
  return apiRequest<CurrentDashboardResponse>("/users/me/dashboard", {}, token);
}

export function updateCurrentDashboard<T>(token: string, dashboard: T) {
  return apiRequest<CurrentDashboardResponse>(
    "/users/me/dashboard",
    {
      method: "PUT",
      body: JSON.stringify(dashboard),
    },
    token,
  );
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


export interface FitnessGoal {
  goal_id: number;
  user_id: number;
  goal_type: string;
  target_value: number | null;
  target_unit: string | null;
  deadline: string | null;
  status: 'active' | 'completed' | 'deleted';
  created_at: string;
  updated_at: string;
}

export function getFitnessGoals(token: string) {
  return apiRequest<{ Goals: FitnessGoal[] }>("/fitnessgoal", {
    method: "GET",
  }, token);
}

export function createFitnessGoal(token: string, payload: Partial<FitnessGoal>) {
  return apiRequest("/fitnessgoal", {
    method: "POST",
    body: JSON.stringify(payload),
  }, token);
}

export function updateFitnessGoal(token: string, goalId: number, payload: Partial<FitnessGoal>) {
  return apiRequest(`/fitnessgoal/${goalId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, token);
}

export function deleteFitnessGoal(token: string, goalId: number) {
  return apiRequest(`/fitnessgoal/${goalId}`, {
    method: "DELETE",
  }, token);
}