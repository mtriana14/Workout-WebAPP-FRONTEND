"use client";

import { Dumbbell } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";

const MOCK_COACH = {
  name: "Jordan Rivera",
  specialty: "Strength & Conditioning",
  bio: "10+ years coaching elite athletes and everyday fitness enthusiasts. Certified NSCA-CSCS with specializations in powerlifting and functional training.",
  pricePerMonth: 149,
  qualifications: ["NSCA-CSCS", "NASM-CPT", "FMS Level 2", "Precision Nutrition L1"],
};

export default function CoachProfile() {
  return (
    <div className="hh-dash-root">

      {/* SIDEBAR */}
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

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content" style={{ maxWidth: 720 }}>

          {/* Header */}
          <div>
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your public coach profile</p>
          </div>

          <div className="hh-card">

            {/* Avatar + upload */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "var(--hh-bg-card-dark)",
                border: "2px solid var(--hh-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--hh-text-muted)" strokeWidth="1.5" style={{ width: 40, height: 40 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>
                  Upload Photo
                </button>
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>
                  Shown on your public profile
                </p>
              </div>
            </div>

            {/* Name + Specialty */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">Full Name</label>
                <div className="hh-input-wrap">
                  <input
                    type="text"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    defaultValue={MOCK_COACH.name}
                  />
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Specialty</label>
                <div className="hh-input-wrap">
                  <input
                    type="text"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    defaultValue={MOCK_COACH.specialty}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Bio</label>
              <textarea
                defaultValue={MOCK_COACH.bio}
                style={{
                  width: "100%", height: 96,
                  padding: "10px 12px",
                  background: "var(--hh-bg-card-dark)",
                  border: "1px solid var(--hh-border)",
                  borderRadius: "var(--hh-radius-sm)",
                  fontSize: "var(--hh-fs-14)",
                  color: "var(--hh-text-primary)",
                  resize: "none",
                  outline: "none",
                  fontFamily: "var(--hh-font-body)",
                }}
              />
            </div>

            {/* Monthly rate */}
            <div className="hh-field" style={{ marginBottom: 16, maxWidth: 240 }}>
              <label className="hh-field__label">Monthly Rate ($)</label>
              <div className="hh-input-wrap">
                <input
                  type="number"
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  defaultValue={MOCK_COACH.pricePerMonth}
                />
              </div>
            </div>

            {/* Certifications */}
            <div style={{ marginBottom: 24 }}>
              <label className="hh-field__label" style={{ display: "block", marginBottom: 8 }}>Certifications</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {MOCK_COACH.qualifications.map((q) => (
                  <span key={q} className="hh-badge">{q}</span>
                ))}
              </div>
            </div>

            <button className="btn btn--primary">Save Profile</button>
          </div>

        </div>
      </main>
    </div>
  );
}
