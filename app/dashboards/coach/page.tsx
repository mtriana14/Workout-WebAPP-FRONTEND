"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Utensils,
  Calendar,
  MessageSquare,
  User,
  Settings,
  DollarSign,
  ClipboardList,
  Bell
} from "lucide-react";

import { getDashboardRouteForRole } from "@/app/lib/api";
import { useMemberPortal } from "@/app/lib/memberPortal";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboards/coach", active: true },
  { label: "My Clients", icon: Users, href: "/dashboards/coach/clients", active: false },
  { label: "Workout Plans", icon: Dumbbell, href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans", icon: Utensils, href: "/dashboards/coach/meals", active: false },
  { label: "Schedule", icon: Calendar, href: "/dashboards/coach/schedule", active: false },
  { label: "Chat", icon: MessageSquare, href: "/dashboards/coach/chat", active: false },
  { label: "Profile", icon: User, href: "/dashboards/coach/profile", active: false },
  { label: "Settings", icon: Settings, href: "/dashboards/coach/settings", active: false },
];

const STAT_CARDS = [
  { label: "Active Clients", icon: Users, value: "24", delta: "↑ +3 this month", deltaClass: "hh-text-green", sub: "2 pending requests" },
  { label: "Earnings This Month", icon: DollarSign, value: "$3,576", delta: "↑ +12%", deltaClass: "hh-text-green", sub: "24 clients × $149" },
  { label: "Pending Requests", icon: ClipboardList, value: "3", delta: "Awaiting response", deltaClass: "hh-text-muted", sub: "" },
  { label: "Unread Messages", icon: Bell, value: "7", delta: "From 4 clients", deltaClass: "hh-text-muted", sub: "" },
];

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 2800 },
  { month: "Oct", revenue: 3100 },
  { month: "Nov", revenue: 2900 },
  { month: "Dec", revenue: 3300 },
  { month: "Jan", revenue: 3500 },
  { month: "Feb", revenue: 3576 },
];

const RECENT_ACTIVITY = [
  { text: "Alex M. completed Push Day", time: "2h ago" },
  { text: "Sam C. sent a message", time: "3h ago" },
  { text: "Taylor K. logged 10k steps", time: "5h ago" },
  { text: "Morgan D. PR'd Bench Press", time: "1d ago" },
];

const maxRevenue = Math.max(...MONTHLY_REVENUE.map((d) => d.revenue));

export default function CoachDashboard() {
  const { displayName, isAuthenticated, isLoading, logout, profile, userRole } = useMemberPortal();

  if (isLoading) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Loading Coach Portal</h1>
              <p className="hh-page-subtitle">Checking your signed-in account and loading coach access.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Coach Sign-In Required</h1>
              <p className="hh-page-subtitle">
                Sign in with a coach account to open the coach dashboard.
              </p>
              <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
                <Link href="/auth/login" className="hh-portal-button hh-portal-button--primary">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (userRole !== "coach") {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Coach Access Only</h1>
              <p className="hh-page-subtitle">
                You are signed in as {profile.firstName} {profile.lastName} with the `{userRole}` role.
              </p>
              <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
                <Link
                  href={getDashboardRouteForRole(userRole)}
                  className="hh-portal-button hh-portal-button--primary"
                >
                  Open My Dashboard
                </Link>
                <button type="button" className="hh-portal-button hh-portal-button--secondary" onClick={logout}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hh-dash-root">
      {/* SIDEBAR */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <Link href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </Link>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="Coach navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                "hh-nav-link" + (item.active ? " hh-nav-link--active" : "")
              }
            >
              <item.icon size={16} style={{ flexShrink: 0, marginRight: 8 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <button type="button" className="hh-sidebar__back hh-sidebar__logout" onClick={logout}>
            Log Out
          </button>
          <Link href="/" className="hh-sidebar__back">
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          {/* Header */}
          <div>
            <h1 className="hh-page-title">COACH DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {displayName}</p>
          </div>

          {/* Stat cards */}
          <div className="hh-stats-grid">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                  <div className="hh-card__icon">
                    <card.icon size={16} color="var(--hh-text-muted)" />
                  </div>
                </div>
                <p className="hh-card__value">{card.value}</p>
                {card.sub && (
                  <p
                    className="hh-text-muted"
                    style={{ fontSize: "var(--hh-fs-12)", marginTop: 2 }}
                  >
                    {card.sub}
                  </p>
                )}
                <p className={"hh-card__delta " + card.deltaClass}>
                  {card.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue chart + Recent Activity */}
          <div className="hh-bottom-row">
            {/* Monthly Revenue chart */}
            <div className="hh-card" style={{ flex: 2 }}>
              <h2 className="hh-panel-heading">Monthly Revenue</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  height: 180,
                  gap: 8,
                }}
              >
                {MONTHLY_REVENUE.map((bar) => (
                  <div
                    key={bar.month}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      height: "100%",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 40,
                          height: `${(bar.revenue / maxRevenue) * 100}%`,
                          background: "var(--hh-accent)",
                          borderRadius: "6px 6px 0 0",
                          minHeight: 8,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "var(--hh-fs-12)",
                        color: "var(--hh-text-muted)",
                      }}
                    >
                      {bar.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="hh-card" style={{ flex: 1 }}>
              <h2 className="hh-panel-heading">Recent Activity</h2>
              <ul className="hh-activity-list">
                {RECENT_ACTIVITY.map((item, i) => (
                  <li key={i} className="hh-activity-item">
                    <p className="hh-activity-item__text">{item.text}</p>
                    <p className="hh-activity-item__time">{item.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}