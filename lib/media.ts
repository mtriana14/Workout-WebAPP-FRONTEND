const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export function resolveMediaUrl(path?: string | null) {
  if (!path) {
    return null;
  }

  if (/^(blob:|data:|https?:\/\/)/i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
