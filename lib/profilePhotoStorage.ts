const PROFILE_PHOTO_PREFIX = "herahealth.profilePhoto.";

function keyForUser(userId?: number | string | null) {
  return userId ? `${PROFILE_PHOTO_PREFIX}${userId}` : null;
}

export function getStoredProfilePhoto(userId?: number | string | null) {
  if (typeof window === "undefined") {
    return null;
  }

  const key = keyForUser(userId);
  return key ? window.localStorage.getItem(key) : null;
}

export function setStoredProfilePhoto(userId: number | string, photoDataUrl: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${PROFILE_PHOTO_PREFIX}${userId}`, photoDataUrl);
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read profile photo."));
    reader.readAsDataURL(file);
  });
}
