"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { coachService } from "@/services/coachService";
 import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import { exerciseService } from "@/services/exerciseService";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalCoaches: 0,
    pendingCoaches: 0,
    totalExercises: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [coachesData, exercisesData, paymentsData] = await Promise.all([
          coachService.getAll(),
          exerciseService.getAll(),
          paymentService.getStats(),
        ]);

        const coaches = coachesData.coaches || [];
        const exercises = exercisesData.exercises || [];

        setStats({
          totalCoaches: coaches.length,
          pendingCoaches: coaches.filter((c) => c.status === "pending").length,
          totalExercises: exercises.length,
          totalRevenue: paymentsData.total_revenue || 0,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

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
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">ADMIN DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {user?.name || "Admin"}</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Coaches
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0" }}>
                {loading ? "..." : stats.totalCoaches}
              </p>
            </div>

            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pending Approvals
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: stats.pendingCoaches > 0 ? "var(--hh-warning)" : "var(--hh-text-primary)" }}>
                {loading ? "..." : stats.pendingCoaches}
              </p>
            </div>

            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Exercises in DB
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-accent)" }}>
                {loading ? "..." : stats.totalExercises}
              </p>
            </div>

            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Total Revenue
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>
                ${loading ? "..." : stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hh-card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <a
                href="/dashboards/admin/coaches"
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--hh-text-primary)",
                  textAlign: "center",
                  transition: "background-color 0.2s",
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Manage Coaches</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>Review and approve</p>
              </a>

              <a
                href="/dashboards/admin/exercises"
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--hh-text-primary)",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Exercise Database</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>Add and edit exercises</p>
              </a>

              <a
                href="/dashboards/admin/payments"
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--hh-text-primary)",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Payment Summary</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>View transactions</p>
              </a>

              <a
                href="/dashboards/admin/users"
                style={{
                  padding: "16px 20px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--hh-text-primary)",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>User Management</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>Manage all users</p>
              </a>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Pending Coach Approvals</h3>
                <a href="/dashboards/admin/coaches" style={{ fontSize: 13, color: "var(--hh-accent)", textDecoration: "none" }}>View All</a>
              </div>
              <div style={{ padding: 24 }}>
                {stats.pendingCoaches > 0 ? (
                  <p style={{ margin: 0, color: "var(--hh-text-secondary)" }}>
                    {stats.pendingCoaches} coach(es) waiting for approval
                  </p>
                ) : (
                  <p style={{ margin: 0, color: "var(--hh-text-muted)", textAlign: "center" }}>
                    No pending approvals
                  </p>
                )}
              </div>
            </div>

            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>System Status</h3>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: "var(--hh-text-secondary)" }}>API Status</span>
                  <span style={{ fontSize: 14, color: "var(--hh-text-green)", fontWeight: 500 }}>Online</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, color: "var(--hh-text-secondary)" }}>Database</span>
                  <span style={{ fontSize: 14, color: "var(--hh-text-green)", fontWeight: 500 }}>Connected</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, color: "var(--hh-text-secondary)" }}>Last Sync</span>
                  <span style={{ fontSize: 14, color: "var(--hh-text-muted)" }}>Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}