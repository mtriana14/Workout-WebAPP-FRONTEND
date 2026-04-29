"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";

const NOTIFICATIONS = [
  { key: "requests", label: "New client requests", sub: "Get notified when a user sends you a request", defaultOn: true },
  { key: "messages", label: "Client messages", sub: "Notifications for new client messages", defaultOn: true },
  { key: "workouts", label: "Workout completions", sub: "When a client completes an assigned workout", defaultOn: true },
  { key: "summary", label: "Weekly summary", sub: "Weekly recap of your clients' activity", defaultOn: false },
];

export default function CoachSettings() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [notifications, setNotifications] = useState(NOTIFICATIONS.map((item) => item.defaultOn));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await profileService.getUser(userId);
        setProfile({
          first_name: response.user.first_name ?? "",
          last_name: response.user.last_name ?? "",
          email: response.user.email ?? "",
          phone: response.user.phone ?? "",
        });
      } catch (error) {
        setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load account settings." });
      }
    };

    void loadProfile();
  }, [userId]);

  const saveProfile = async () => {
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before saving settings." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updateUser(userId, profile);
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before changing your password." });
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      setStatus({ type: "error", message: "New password and confirmation do not match." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.updatePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
      setStatus({ type: "success", message: response.Success ?? "Password updated." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to update password." });
    } finally {
      setSaving(false);
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
        <div className="hh-dash-content" style={{ maxWidth: 720 }}>
          <div>
            <h1 className="hh-page-title">SETTINGS</h1>
            <p className="hh-page-subtitle">Manage your account and preferences</p>
          </div>

          {status ? <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p> : null}

          <div className="hh-card">
            <h3 className="hh-panel-heading">Account</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
              <div className="hh-field">
                <label className="hh-field__label">First Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={profile.first_name} onChange={(event) => setProfile((current) => ({ ...current, first_name: event.target.value }))} />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Last Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={profile.last_name} onChange={(event) => setProfile((current) => ({ ...current, last_name: event.target.value }))} />
              </div>
            </div>
            <div className="hh-field" style={{ marginBottom: 12 }}>
              <label className="hh-field__label">Email</label>
              <input type="email" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Phone</label>
              <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <button className="btn btn--primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="hh-card">
            <h3 className="hh-panel-heading">Security</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["current_password", "Current Password"],
                ["new_password", "New Password"],
                ["confirm_password", "Confirm New Password"],
              ].map(([key, label]) => (
                <div className="hh-field" key={key}>
                  <label className="hh-field__label">{label}</label>
                  <input
                    type="password"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={passwords[key as keyof typeof passwords]}
                    onChange={(event) => setPasswords((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn--ghost" onClick={updatePassword} disabled={saving} style={{ border: "1px solid var(--hh-border)", marginTop: 16 }}>
              Update Password
            </button>
          </div>

          <div className="hh-card">
            <h3 className="hh-panel-heading">Notifications</h3>
            {NOTIFICATIONS.map((item, index) => (
              <button
                type="button"
                key={item.key}
                onClick={() => setNotifications((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", border: "none", borderBottom: index < NOTIFICATIONS.length - 1 ? "1px solid var(--hh-border)" : "none", background: "transparent", textAlign: "left", cursor: "pointer" }}
              >
                <span>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>{item.label}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--hh-text-muted)" }}>{item.sub}</span>
                </span>
                <span className="hh-badge">{notifications[index] ? "On" : "Off"}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
