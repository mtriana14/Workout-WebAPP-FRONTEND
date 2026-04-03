"use client";

import { useState } from "react";
import { X, Dumbbell } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboards/coach",          active: false },
  { label: "My Clients",    href: "/dashboards/coach/clients",  active: false },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans",    href: "/dashboards/coach/meals",    active: false },
  { label: "Schedule",      href: "/dashboards/coach/schedule", active: false },
  { label: "Chat",          href: "/dashboards/coach/chat",     active: false },
  { label: "Profile",       href: "/dashboards/coach/profile",  active: false },
  { label: "Settings",      href: "/dashboards/coach/settings", active: true  },
];

const NOTIFICATIONS = [
  { label: "New client requests",   sub: "Get notified when a user sends you a request",  defaultOn: true  },
  { label: "Client messages",       sub: "Notifications for new client messages",          defaultOn: true  },
  { label: "Workout completions",   sub: "When a client completes an assigned workout",    defaultOn: true  },
  { label: "Weekly summary",        sub: "Weekly recap of your clients' activity",         defaultOn: false },
];

export default function CoachSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notifications, setNotifications] = useState(
    NOTIFICATIONS.map((n) => n.defaultOn)
  );

  const toggleNotification = (index: number) => {
    setNotifications((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

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

        <nav className="hh-sidebar__nav" aria-label="Coach navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={"hh-nav-link" + (item.active ? " hh-nav-link--active" : "")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content" style={{ maxWidth: 720 }}>

          {/* Header */}
          <div>
            <h1 className="hh-page-title">SETTINGS</h1>
            <p className="hh-page-subtitle">Manage your account and preferences</p>
          </div>

          {/* Profile */}
          <div className="hh-card">
            <h3 className="hh-panel-heading">Profile</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--hh-bg-card-dark)",
                border: "2px solid var(--hh-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--hh-text-muted)" strokeWidth="1.5" style={{ width: 32, height: 32 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>
                  Upload Photo
                </button>
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
              <div className="hh-field">
                <label className="hh-field__label">First Name</label>
                <div className="hh-input-wrap">
                  <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" defaultValue="Jordan" />
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Last Name</label>
                <div className="hh-input-wrap">
                  <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" defaultValue="Rivera" />
                </div>
              </div>
            </div>

            <div className="hh-field" style={{ marginBottom: 12 }}>
              <label className="hh-field__label">Email</label>
              <div className="hh-input-wrap">
                <input type="email" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" defaultValue="jordan@herahealth.com" />
              </div>
            </div>

            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Specialty</label>
              <div className="hh-input-wrap">
                <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" defaultValue="Strength & Conditioning" />
              </div>
            </div>

            <button className="btn btn--primary">Save Changes</button>
          </div>

          {/* Security */}
          <div className="hh-card">
            <h3 className="hh-panel-heading">Security</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="hh-field">
                <label className="hh-field__label">Current Password</label>
                <div className="hh-input-wrap">
                  <input type="password" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="••••••••" />
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">New Password</label>
                <div className="hh-input-wrap">
                  <input type="password" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="••••••••" />
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Confirm New Password</label>
                <div className="hh-input-wrap">
                  <input type="password" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="••••••••" />
                </div>
              </div>
            </div>
            <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", marginTop: 16 }}>
              Update Password
            </button>
          </div>

          {/* Notifications */}
          <div className="hh-card">
            <h3 className="hh-panel-heading">Notifications</h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: i < NOTIFICATIONS.length - 1 ? "0.6px solid var(--hh-border-50)" : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 500, color: "var(--hh-text-primary)" }}>{n.label}</div>
                    <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{n.sub}</div>
                  </div>
                  <button
                    onClick={() => toggleNotification(i)}
                    style={{
                      width: 40, height: 24, borderRadius: 9999,
                      background: notifications[i] ? "var(--hh-accent)" : "hsl(240 4% 18%)",
                      border: "none", padding: 2,
                      display: "flex", alignItems: "center",
                      cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", background: "white",
                      marginLeft: notifications[i] ? "auto" : 0,
                      transition: "margin 0.2s",
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="hh-card" style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
            <h3 className="hh-panel-heading" style={{ color: "#f87171" }}>Danger Zone</h3>
            <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)", marginBottom: 16 }}>
              Permanently delete your coach account and all associated data.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171",
                background: "transparent", padding: "8px 16px",
                borderRadius: "var(--hh-radius-sm)", fontSize: "var(--hh-fs-14)",
                cursor: "pointer", fontFamily: "var(--hh-font-body)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              Delete Account
            </button>
          </div>

        </div>
      </main>

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="hh-card"
            style={{ width: "100%", maxWidth: 384, borderColor: "rgba(239, 68, 68, 0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontWeight: 600, color: "#f87171" }}>Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={16} color="var(--hh-text-muted)" />
              </button>
            </div>
            <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)", marginBottom: 16 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn--ghost"
                style={{ flex: 1, border: "1px solid var(--hh-border)" }}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  flex: 1, background: "#dc2626", color: "white",
                  border: "none", borderRadius: "var(--hh-radius-sm)",
                  fontSize: "var(--hh-fs-14)", fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--hh-font-body)",
                }}
                onClick={() => setShowDeleteModal(false)}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
