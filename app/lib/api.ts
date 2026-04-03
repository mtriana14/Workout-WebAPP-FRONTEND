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
  return apiRequest<AuthSessionLikeResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}

export function fetchCurrentProfile(token: string) {
  return apiRequest<CurrentProfileResponse>("/users/me", {}, token);
}

export function updateCurrentProfile<T>(token: string, profile: T) {
  return apiRequest<CurrentProfileResponse>(
    "/users/me",
    {
      method: "PUT",
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
