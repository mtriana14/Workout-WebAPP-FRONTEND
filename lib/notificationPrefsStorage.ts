const PREFS_PREFIX = "herahealth.notifPrefs.";

export type NotifPrefs = Record<string, boolean>;

export function getNotifPrefs(userId: number | string): NotifPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(`${PREFS_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as NotifPrefs) : {};
  } catch {
    return {};
  }
}

export function setNotifPrefs(userId: number | string, prefs: NotifPrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${PREFS_PREFIX}${userId}`, JSON.stringify(prefs));
}
