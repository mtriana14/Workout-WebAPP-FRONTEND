"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MemberPortalShell } from "@/app/components/memberPortalShell";
import {
  type MemberProfile,
  useMemberPortal,
} from "@/app/lib/memberPortal";

export default function ProfilePage() {
  const router = useRouter();
  const { dashboard, profile, refreshPortal, saveProfile } = useMemberPortal();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<MemberProfile>(profile);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function handleDraftChange<Key extends keyof MemberProfile>(key: Key, value: MemberProfile[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleCancel() {
    setDraft(profile);
    setIsEditing(false);
    setStatus("");
  }

  async function handleSave() {
    try {
      await saveProfile(draft);
      setStatus("Profile saved.");
      setIsEditing(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save profile.");
    }
  }

  async function handleReload() {
    await refreshPortal();
    setStatus("Latest profile loaded from the database.");
    setIsEditing(false);
  }

  return (
    <MemberPortalShell
      activePage="profile"
      title="EDIT PROFILE"
      subtitle="Update the profile information that appears across the member dashboard and coach-facing summaries."
      headerActions={
        <>
          <button type="button" className="hh-portal-button hh-portal-button--ghost" onClick={handleReload}>
            Reload Data
          </button>
          {isEditing ? (
            <>
              <button type="button" className="hh-portal-button hh-portal-button--secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={handleSave}>
                Save Profile
              </button>
            </>
          ) : (
            <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </>
      }
    >
      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 2 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Personal Information
              </h2>
              <p className="hh-portal-card-copy">Basic account details and health context.</p>
            </div>
          </div>

          {status ? <p className="hh-portal-status">{status}</p> : null}

          <div className="hh-portal-form-grid">
            <label className="hh-field">
              <span className="hh-field__label">First name</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.firstName : profile.firstName}
                onChange={(event) => handleDraftChange("firstName", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Last name</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.lastName : profile.lastName}
                onChange={(event) => handleDraftChange("lastName", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Email</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.email : profile.email}
                onChange={(event) => handleDraftChange("email", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Phone</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.phone : profile.phone}
                onChange={(event) => handleDraftChange("phone", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">City</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.city : profile.city}
                onChange={(event) => handleDraftChange("city", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Pronouns</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.pronouns : profile.pronouns}
                onChange={(event) => handleDraftChange("pronouns", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Height</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.height : profile.height}
                onChange={(event) => handleDraftChange("height", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field">
              <span className="hh-field__label">Weight</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.weight : profile.weight}
                onChange={(event) => handleDraftChange("weight", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Primary goal</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.goal : profile.goal}
                onChange={(event) => handleDraftChange("goal", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Emergency contact</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={isEditing ? draft.emergencyContact : profile.emergencyContact}
                onChange={(event) => handleDraftChange("emergencyContact", event.target.value)}
                readOnly={!isEditing}
              />
            </label>

            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Bio</span>
              <textarea
                className="hh-portal-textarea"
                value={isEditing ? draft.bio : profile.bio}
                onChange={(event) => handleDraftChange("bio", event.target.value)}
                readOnly={!isEditing}
              />
            </label>
          </div>
        </section>

        <section className="hh-card" style={{ flex: 1 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Coaching Snapshot
              </h2>
              <p className="hh-portal-card-copy">Profile fields that connect directly to the dashboard.</p>
            </div>
          </div>

          <div className="hh-portal-summary-list">
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Assigned coach</span>
              <p className="hh-portal-summary-value">{profile.coachName}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Membership</span>
              <p className="hh-portal-summary-value">{profile.membership}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Next session</span>
              <p className="hh-portal-summary-value">{dashboard.nextSessionTitle}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Session time</span>
              <p className="hh-portal-summary-value">{dashboard.nextSessionDate}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Current focus</span>
              <p className="hh-portal-summary-value">{dashboard.focusArea}</p>
            </div>
          </div>

          {/* Become a Coach Link (UC 1.9) */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #2c2c30" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 8 }}>Professional Services</h3>
            <p className="hh-portal-card-copy" style={{ marginBottom: 16 }}>
              Are you a certified fitness professional? Apply to offer your services to clients on our platform.
            </p>
            <button 
              className="btn btn--secondary" 
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => router.push("/become-coach")}
            >
              Become a Coach
            </button>
          </div>
        </section>
      </div>
    </MemberPortalShell>
  );
}