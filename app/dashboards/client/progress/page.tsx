"use client";

import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { useAuthStore } from "@/store/authStore";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

export default function ProgressPage() {
  const { user } = useAuthStore();

  return (
    <div className="hh-dash-root">
      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">MY PROGRESS</h1>
            <p className="hh-page-subtitle">Track your fitness journey</p>
          </div>

          {/* Placeholder Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Workouts Completed</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-accent)" }}>—</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Current Streak</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>— days</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Calories This Week</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0" }}>—</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Goals Met</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-warning)" }}>—%</p>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="hh-card" style={{ padding: 60, textAlign: "center" }}>
            <p style={{ fontSize: 48, margin: 0 }}>📊</p>
            <h2 style={{ margin: "16px 0 8px", fontSize: 20 }}>Progress Tracking Coming Soon</h2>
            <p style={{ margin: 0, color: "var(--hh-text-muted)", maxWidth: 400, marginInline: "auto" }}>
              Track your workouts, nutrition, and overall fitness progress. 
              View charts, set goals, and celebrate your achievements.
            </p>
          </div>

          {/* Placeholder Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Weekly Activity</h3>
              <div style={{ height: 200, backgroundColor: "var(--hh-bg-secondary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--hh-text-muted)" }}>Chart placeholder</p>
              </div>
            </div>
            <div className="hh-card" style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Weight Progress</h3>
              <div style={{ height: 200, backgroundColor: "var(--hh-bg-secondary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--hh-text-muted)" }}>Chart placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}