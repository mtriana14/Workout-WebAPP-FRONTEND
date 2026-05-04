import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_PROXY_URL ?? "/api/backend";
const BACKEND_LABEL = process.env.NEXT_PUBLIC_API_URL ?? BASE_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  public?: boolean; // si es true no inyecta el token
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // In-memory Zustand state is per-tab — always prefer it.
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;

  // Fallback: sessionStorage (also per-tab, survives hard refreshes within the tab).
  try {
    const persisted = sessionStorage.getItem("auth");
    if (persisted) {
      const parsed = JSON.parse(persisted);
      if (typeof parsed.state?.token === "string" && parsed.state.token.length > 0) {
        return parsed.state.token;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().clearAuth();
  sessionStorage.removeItem("auth");
  // Clean up any legacy localStorage keys from before this fix.
  localStorage.removeItem("auth");
  localStorage.removeItem("herahealth.auth");
}

function buildUrl(endpoint: string) {
  return `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    public: isPublic = false,
  } = options;
  const token = isPublic ? null : getToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  if (!isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let res: Response;
  const url = buildUrl(endpoint);

  try {
    res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error(`Could not reach the backend at ${BACKEND_LABEL}. Make sure the Flask server is running.`);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredAuth();
      throw new Error("Session expired. Please sign in again.");
    }

    const message =
      json && typeof json === "object"
        ? ((json as { error?: string; message?: string }).error ??
          (json as { error?: string; message?: string }).message)
        : null;

    throw new Error(message ?? `API error: ${res.status} ${res.statusText}`);
  }

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  return json as T;
}
