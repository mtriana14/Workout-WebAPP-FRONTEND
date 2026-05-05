"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import {
  fetchCurrentProfile,
  updateCurrentProfile,
  updateCoachProfile,
  getStoredAuthToken,
} from "@/app/lib/api";

export default function CoachProfile() {
  const [userForm, setUserForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [coachForm, setCoachForm] = useState({ bio: "", specialization: "fitness", certifications: "", cost: "", experience_years: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) { setError("Not authenticated."); setIsLoading(false); return; }
    fetchCurrentProfile(token)
      .then(({ profile }) => {
        setUserForm({
          firstName: profile.firstName ?? "",
          lastName:  profile.lastName  ?? "",
          email:     profile.email     ?? "",
          phone:     profile.phone     ?? "",
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
      await updateCurrentProfile(token, userForm);
      await updateCoachProfile(token, {
        bio:             coachForm.bio || undefined,
        specialization:  coachForm.specialization as any || undefined,
        certifications:  coachForm.certifications || undefined,
        cost:            coachForm.cost ? Number(coachForm.cost) : undefined,
        experience_years: coachForm.experience_years ? Number(coachForm.experience_years) : undefined,
      });
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
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your public coach profile</p>
          </div>

          {error  && <p className="hh-error-msg">{error}</p>}
          {status && <p className="hh-portal-status">{status}</p>}

          {isLoading ? (
            <p className="hh-portal-card-copy">Loading profile...</p>
          ) : (
            <>
              {/* User info */}
              <div className="hh-card">
                <h3 className="hh-panel-heading">Personal Info</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: "var(--hh-bg-card-dark)", border: "2px solid var(--hh-border)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--hh-text-muted)" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>Upload Photo</button>
                    <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>Shown on your public profile</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="hh-field">
                    <label className="hh-field__label">First Name</label>
                    <div className="hh-input-wrap">
                      <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={userForm.firstName} onChange={(e) => setUserForm((p) => ({ ...p, firstName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="hh-field">
                    <label className="hh-field__label">Last Name</label>
                    <div className="hh-input-wrap">
                      <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={userForm.lastName} onChange={(e) => setUserForm((p) => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="hh-field" style={{ marginBottom: 16 }}>
                  <label className="hh-field__label">Email</label>
                  <div className="hh-input-wrap">
                    <input type="email" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>

                <div className="hh-field">
                  <label className="hh-field__label">Phone</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={userForm.phone} onChange={(e) => setUserForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Coach info */}
              <div className="hh-card">
                <h3 className="hh-panel-heading">Coach Details</h3>

                <div className="hh-field" style={{ marginBottom: 16 }}>
                  <label className="hh-field__label">Specialization</label>
                  <select
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={coachForm.specialization}
                    onChange={(e) => setCoachForm((p) => ({ ...p, specialization: e.target.value }))}
                  >
                    <option value="fitness">Fitness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className="hh-field" style={{ marginBottom: 16 }}>
                  <label className="hh-field__label">Bio</label>
                  <textarea
                    value={coachForm.bio}
                    onChange={(e) => setCoachForm((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe your coaching experience..."
                    style={{
                      width: "100%", height: 96, padding: "10px 12px",
                      background: "var(--hh-bg-card-dark)", border: "1px solid var(--hh-border)",
                      borderRadius: "var(--hh-radius-sm)", fontSize: "var(--hh-fs-14)",
                      color: "var(--hh-text-primary)", resize: "none", outline: "none",
                      fontFamily: "var(--hh-font-body)",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div className="hh-field">
                    <label className="hh-field__label">Monthly Rate ($)</label>
                    <div className="hh-input-wrap">
                      <input type="number" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={coachForm.cost} onChange={(e) => setCoachForm((p) => ({ ...p, cost: e.target.value }))} />
                    </div>
                  </div>
                  <div className="hh-field">
                    <label className="hh-field__label">Years of Experience</label>
                    <div className="hh-input-wrap">
                      <input type="number" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={coachForm.experience_years} onChange={(e) => setCoachForm((p) => ({ ...p, experience_years: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="hh-field" style={{ marginBottom: 24 }}>
                  <label className="hh-field__label">Certifications</label>
                  <div className="hh-input-wrap">
                    <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={coachForm.certifications}
                      onChange={(e) => setCoachForm((p) => ({ ...p, certifications: e.target.value }))}
                      placeholder="e.g. NSCA-CSCS, NASM-CPT" />
                  </div>
                </div>

                <button className="btn btn--primary" onClick={() => void handleSave()} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}