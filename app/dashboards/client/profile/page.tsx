"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dumbbell, User } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { fileToDataUrl } from "@/lib/profilePhotoStorage";
import { resolveMediaUrl } from "@/lib/media";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  profile_photo: "",
};

export default function ClientProfile() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { user: u } = await profileService.getUser(Number(userId));
        setForm({
          first_name: u.first_name ?? "",
          last_name: u.last_name ?? "",
          email: u.email ?? "",
          phone: u.phone ?? "",
          profile_photo: u.profile_photo ?? "",
        });
      } catch {
        setForm({
          ...EMPTY_FORM,
          first_name: user?.first_name ?? user?.firstName ?? "",
          last_name: user?.last_name ?? user?.lastName ?? "",
          email: user?.email ?? "",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [user, userId]);

  const saveProfile = async () => {
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before saving your profile." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updateUser(Number(userId), {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
      });
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setStatus({ type: "error", message: "Upload a JPG or PNG image." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.uploadPhoto(file);
      const photo = response.profile_photo ?? (await fileToDataUrl(file));
      setForm((current) => ({ ...current, profile_photo: photo }));
      setStatus({ type: "success", message: response.Success ?? "Profile photo uploaded." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to upload photo." });
    } finally {
      setSaving(false);
      if (event.target) event.target.value = "";
    }
  };

  return (
    <div className="hh-dash-root">
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content" style={{ maxWidth: 680 }}>
          <div>
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your account information</p>
          </div>

          <div className="hh-card">
            {status ? (
              <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p>
            ) : null}

            {/* Photo */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--hh-bg-card-dark)",
                  border: "2px solid var(--hh-border)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {form.profile_photo ? (
                  <img
                    src={resolveMediaUrl(form.profile_photo) ?? form.profile_photo}
                    alt="Profile"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={32} color="var(--hh-text-muted)" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={uploadPhoto}
                  style={{ display: "none" }}
                />
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || loading}
                  style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}
                >
                  Upload Photo
                </button>
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>
                  JPG or PNG, shown to your coach.
                </p>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">First Name</label>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={form.first_name}
                  onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))}
                />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Last Name</label>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={form.last_name}
                  onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Email</label>
              <input
                type="email"
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              />
            </div>

            <div className="hh-field" style={{ marginBottom: 24 }}>
              <label className="hh-field__label">Phone</label>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={form.phone}
                onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <button
              className="btn btn--primary"
              onClick={saveProfile}
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
