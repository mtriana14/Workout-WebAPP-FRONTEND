"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { fetchCurrentProfile, updateCurrentProfile, getStoredAuthToken } from "@/app/lib/api";

export default function ClientProfile() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", weight: "", height: "", goal: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) { setError("Not authenticated."); setIsLoading(false); return; }
    fetchCurrentProfile(token)
      .then(({ profile }) => {
        setForm({
          firstName: profile.firstName ?? "",
          lastName:  profile.lastName  ?? "",
          email:     profile.email     ?? "",
          phone:     profile.phone     ?? "",
          weight:    profile.weight    ?? "",
          height:    profile.height    ?? "",
          goal:      profile.goal      ?? "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSave() {
    const token = getStoredAuthToken();
    if (!token) { setError("Not authenticated."); return; }
    try {
      setIsSaving(true);
      setError("");
      setStatus("");
      await updateCurrentProfile(token, form);
      setStatus("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  }

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
        <div className="hh-dash-content" style={{ maxWidth: 720 }}>

          <div>
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your personal information</p>
          </div>

          {error  && <p className="hh-error-msg">{error}</p>}
          {status && <p className="hh-portal-status">{status}</p>}

          {isLoading ? (
            <p className="hh-portal-card-copy">Loading profile...</p>
          ) : (
            <div className="hh-card">
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "var(--hh-bg-card-dark)",
                  border: "2px solid var(--hh-border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--hh-text-muted)" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>
                    Upload Photo
                  </button>
                  <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>JPG, PNG up to 5MB</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="hh-field">
                  <label className="hh-field__label">First Name</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                </div>
                <div className="hh-field">
                  <label className="hh-field__label">Last Name</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="hh-field" style={{ marginBottom: 16 }}>
                <label className="hh-field__label">Email</label>
                <div className="hh-input-wrap">
                  <input type="email" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              <div className="hh-field" style={{ marginBottom: 16 }}>
                <label className="hh-field__label">Phone</label>
                <div className="hh-input-wrap">
                  <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div className="hh-field">
                  <label className="hh-field__label">Weight (lbs)</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} />
                  </div>
                </div>
                <div className="hh-field">
                  <label className="hh-field__label">Height</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.height} onChange={(e) => setForm((p) => ({ ...p, height: e.target.value }))} />
                  </div>
                </div>
              </div>

              <div className="hh-field" style={{ marginBottom: 24 }}>
                <label className="hh-field__label">Fitness Goal</label>
                <textarea
                  value={form.goal}
                  onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))}
                  style={{
                    width: "100%", height: 80, padding: "10px 12px",
                    background: "var(--hh-bg-card-dark)", border: "1px solid var(--hh-border)",
                    borderRadius: "var(--hh-radius-sm)", fontSize: "var(--hh-fs-14)",
                    color: "var(--hh-text-primary)", resize: "none", outline: "none",
                    fontFamily: "var(--hh-font-body)",
                  }}
                />
              </div>

              <button className="btn btn--primary" onClick={() => void handleSave()} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}