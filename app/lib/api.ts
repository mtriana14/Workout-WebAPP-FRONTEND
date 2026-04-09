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
  return apiRequest<CurrentProfileResponse>(
    "/auth/update", // Changed from "/users/me"
    {
      method: "PATCH", // Changed from "PUT"
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
    // Passing the password in case the backend delete controller strictly requires it for verification
    body: JSON.stringify({ password }),
  }, token);
}

export function applyForCoachRequest(token: string, payload: { specialization: string, experience_years: number, certifications: string }) {
  // Using the coach_apply blueprint route
  return apiRequest("/coach/apply", { 
    method: "POST",
    body: JSON.stringify(payload)
  }, token);
}

export function fakePasswordResetRequest(email: string) {
  // Skeleton API call for UC 1.11
  return new Promise((resolve) => setTimeout(resolve, 1500));
}