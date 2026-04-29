"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dumbbell } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { profileService, type CoachProfile } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";

const EMPTY_PROFILE = {
  first_name: "",
  last_name: "",
  email: "",
  specialization: "fitness",
  certifications: "",
  experience_years: "",
  cost: "149",
  hourly_rate: "149",
  bio: "",
  profile_photo: "",
};

export default function CoachProfile() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY_PROFILE);
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
        const { profile } = await profileService.getCoach(userId);
        setForm({
          first_name: profile.first_name ?? "",
          last_name: profile.last_name ?? "",
          email: profile.email ?? "",
          specialization: profile.specialization ?? "fitness",
          certifications: profile.certifications ?? "",
          experience_years: profile.experience_years?.toString() ?? "",
          cost: profile.cost?.toString() ?? "149",
          hourly_rate: profile.hourly_rate?.toString() ?? profile.cost?.toString() ?? "149",
          bio: profile.bio ?? "",
          profile_photo: profile.profile_photo ?? "",
        });
      } catch (error) {
        setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load profile." });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [userId]);

  const saveProfile = async () => {
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before saving your coach profile." });
      return;
    }

    try {
      setSaving(true);
      await profileService.updateUser(userId, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
      const response = await profileService.updateCoach(userId, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        specialization: form.specialization as CoachProfile["specialization"],
        certifications: form.certifications,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        cost: Number(form.cost || 0),
        hourly_rate: Number(form.hourly_rate || form.cost || 0),
        bio: form.bio,
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
    if (!file || !userId) {
      return;
    }

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setStatus({ type: "error", message: "Upload a JPG or PNG image." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.uploadPhoto(file);
      setForm((current) => ({ ...current, profile_photo: URL.createObjectURL(file) }));
      setStatus({ type: "success", message: response.Success ?? "Profile photo uploaded" });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to upload photo." });
    } finally {
      setSaving(false);
      if (event.target) {
        event.target.value = "";
      }
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
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content" style={{ maxWidth: 760 }}>
          <div>
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your public coach profile</p>
          </div>

          <div className="hh-card">
            {status ? (
              <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--hh-bg-card-dark)", border: "2px solid var(--hh-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.profile_photo ? (
                  <img src={form.profile_photo} alt="Coach profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Dumbbell size={32} color="var(--hh-text-muted)" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={uploadPhoto} style={{ display: "none" }} />
                <button className="btn btn--ghost" type="button" onClick={() => fileInputRef.current?.click()} disabled={saving} style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>
                  Upload Photo
                </button>
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>
                  Saved to your public profile.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">First Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Last Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Specialty</label>
                <select className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.specialization} onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))} style={{ appearance: "auto" }}>
                  <option value="fitness">Fitness</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="both">Fitness and Nutrition</option>
                </select>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Monthly Rate ($)</label>
                <input type="number" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.cost} onChange={(event) => setForm((current) => ({ ...current, cost: event.target.value, hourly_rate: event.target.value }))} />
              </div>
            </div>

            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Bio</label>
              <textarea className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} style={{ minHeight: 110, resize: "vertical", paddingTop: 12 }} />
            </div>

            <div className="hh-field" style={{ marginBottom: 24 }}>
              <label className="hh-field__label">Certifications</label>
              <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.certifications} onChange={(event) => setForm((current) => ({ ...current, certifications: event.target.value }))} placeholder="NSCA-CSCS, NASM-CPT" />
            </div>

            <button className="btn btn--primary" onClick={saveProfile} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
