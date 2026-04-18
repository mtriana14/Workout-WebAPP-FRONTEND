const BASE_URL = "http://localhost:5000/api/";
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  public?: boolean; // si es true no inyecta el token
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const authStorage = localStorage.getItem("auth"); // "auth" es el name que pusiste en persist
  if (!authStorage) return null;

  try {
    const parsed = JSON.parse(authStorage);
    return parsed.state?.token || null;
  } catch (e) {
    return null;
  }
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

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  console.log(token);
  const json = await res.json();

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  return json as T;
}
