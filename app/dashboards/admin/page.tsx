"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  DollarSign,
  Dumbbell,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { coachService } from "@/services/coachService";
import { exerciseService } from "@/services/exerciseService";
import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import { NotificationBell } from "@/app/components/NotificationBell";

interface AdminStats {
  totalCoaches: number;
  pendingCoaches: number;
  totalExercises: number;
  totalRevenue: number;
}

interface AdminCard {
  label: string;
  icon: LucideIcon;
  value: string;
  helper: string;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<AdminStats>({
    totalCoaches: 0,
    pendingCoaches: 0,
    totalExercises: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [coachResponse, exerciseResponse, paymentResponse] =
          await Promise.allSettled([
            coachService.getAll(),
            exerciseService.getAll(),
            paymentService.getStats(),
          ]);

        const coaches =
          coachResponse.status === "fulfilled"
            ? (coachResponse.value.coaches ?? [])
            : [];
        const exercises =
          exerciseResponse.status === "fulfilled"
            ? (exerciseResponse.value.exercises ?? [])
            : [];
        const revenue =
          paymentResponse.status === "fulfilled"
            ? (paymentResponse.value.total_revenue ??
              paymentResponse.value.summary?.total_revenue ??
              0)
            : 0;

        setStats({
          totalCoaches: coaches.length,
          pendingCoaches: coaches.filter((coach) => coach.status === "pending")
            .length,
          totalExercises: exercises.length,
          totalRevenue: revenue,
        });
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  const cards: AdminCard[] = [
    {
      label: "Total Coaches",
      icon: UserCheck,
      value: loading ? "..." : String(stats.totalCoaches),
      helper: "Approved and pending coach accounts",
    },
    {
      label: "Pending Approvals",
      icon: ClipboardList,
      value: loading ? "..." : String(stats.pendingCoaches),
      helper: "Coach registrations waiting for review",
    },
    {
      label: "Exercises",
      icon: Dumbbell,
      value: loading ? "..." : String(stats.totalExercises),
      helper: "Exercises available in the database",
    },
    {
      label: "Revenue",
      icon: DollarSign,
      value: loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`,
      helper: "Total revenue tracked by the admin API",
    },
  ];

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
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">
            Back to Home
          </a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <h1 className="hh-page-title">ADMIN DASHBOARD</h1>
              <p className="hh-page-subtitle">Welcome back, {user?.name ?? "Admin"}.</p>
            </div>
            {(user?.id ?? user?.user_id) && (
              <NotificationBell userId={Number(user?.id ?? user?.user_id)} />
            )}
          </div>

          <div className="hh-stats-grid">
            {cards.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                  <div className="hh-card__icon">
                    <card.icon size={16} color="var(--hh-text-muted)" />
                  </div>
                </div>
                <p className="hh-card__value">{card.value}</p>
                <p className="hh-card__delta hh-text-muted">{card.helper}</p>
              </div>
            ))}
          </div>

          <div className="hh-bottom-row">
            <div className="hh-card" style={{ flex: 2 }}>
              <h2 className="hh-panel-heading">Quick Actions</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <a href="/dashboards/admin/coaches" className="hh-nav-link">
                  Manage Coaches
                </a>
                <a href="/dashboards/admin/exercises" className="hh-nav-link">
                  Review Exercises
                </a>
                <a href="/dashboards/admin/payments" className="hh-nav-link">
                  View Payments
                </a>
                <a href="/dashboards/admin/users" className="hh-nav-link">
                  Manage Users
                </a>
              </div>
            </div>

            <div className="hh-card" style={{ flex: 1 }}>
              <h2 className="hh-panel-heading">Status</h2>
              <p className="hh-card__delta hh-text-muted">
                API-backed admin summary loaded from coaches, exercises, and
                payments.
              </p>
              <p
                className="hh-card__delta hh-text-muted"
                style={{ marginTop: 12 }}
              >
                Pending coach reviews: {loading ? "..." : stats.pendingCoaches}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
