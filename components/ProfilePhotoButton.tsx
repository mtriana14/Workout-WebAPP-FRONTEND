"use client";

import { useEffect, useState } from "react";
import { resolveMediaUrl } from "@/lib/media";
import { getStoredProfilePhoto } from "@/lib/profilePhotoStorage";
import { Camera, UserRound } from "lucide-react";

function getInitials(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || null;
}

interface ProfilePhotoButtonProps {
  displayName: string;
  profilePhoto?: string | null;
  href?: string;
  userId?: number | string | null;
}

export function ProfilePhotoButton({
  displayName,
  profilePhoto,
  href = "/dashboards/user/profile",
  userId,
}: ProfilePhotoButtonProps) {
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const photoUrl = resolveMediaUrl(profilePhoto ?? localPhoto);
  const initials = getInitials(displayName);

  useEffect(() => {
    setLocalPhoto(getStoredProfilePhoto(userId));
  }, [userId]);

  return (
    <a
      href={href}
      aria-label="Open profile photo upload"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        border: "1px solid var(--hh-border)",
        borderRadius: 18,
        background:
          "linear-gradient(135deg, rgba(160, 91, 151, 0.22), rgba(255, 255, 255, 0.04))",
        color: "var(--hh-text)",
        textDecoration: "none",
        minWidth: 190,
        boxShadow: "0 14px 30px rgba(0, 0, 0, 0.18)",
      }}
    >
      <span
        style={{
          position: "relative",
          width: 54,
          height: 54,
          borderRadius: "50%",
          backgroundColor: "rgba(160, 91, 151, 0.35)",
          border: "2px solid rgba(255, 255, 255, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          flexShrink: 0,
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${displayName} profile photo`}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : initials ? (
          <span style={{ color: "white", fontWeight: 800, fontSize: 18 }}>{initials}</span>
        ) : (
          <UserRound size={26} color="white" />
        )}
        <span
          style={{
            position: "absolute",
            right: -2,
            bottom: -2,
            width: 22,
            height: 22,
            borderRadius: "50%",
            backgroundColor: "var(--hh-accent)",
            border: "2px solid var(--hh-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Camera size={12} color="white" />
        </span>
      </span>
      <span>
        <span style={{ display: "block", fontSize: 12, color: "var(--hh-text-muted)" }}>
          Profile Photo
        </span>
        <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>
          {photoUrl ? "Edit Photo" : "Upload Photo"}
        </span>
      </span>
    </a>
  );
}
