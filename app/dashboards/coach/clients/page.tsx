"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboards/coach", active: false },
  { label: "My Clients", href: "/dashboards/coach/clients", active: true },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans", href: "/dashboards/coach/meals", active: false },
  { label: "Schedule", href: "/dashboards/coach/schedule", active: false },
  { label: "Chat", href: "/dashboards/coach/chat", active: false },
  { label: "Profile", href: "/dashboards/coach/profile", active: false },
  { label: "Settings", href: "/dashboards/coach/settings", active: false },
];

const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Alex Morgan",
    goal: "Build Muscle",
    lastActive: "2h ago",
    progress: 72,
    avatar: null,
  },
  {
    id: "2",
    name: "Sam Chen",
    goal: "Lose Weight",
    lastActive: "1d ago",
    progress: 45,
    avatar: null,
  },
  {
    id: "3",
    name: "Taylor Kim",
    goal: "Run a 5K",
    lastActive: "3h ago",
    progress: 88,
    avatar: null,
  },
  {
    id: "4",
    name: "Morgan Davis",
    goal: "Improve Endurance",
    lastActive: "5h ago",
    progress: 60,
    avatar: null,
  },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", calories: 320 },
  { day: "Tue", calories: 0 },
  { day: "Wed", calories: 480 },
  { day: "Thu", calories: 560 },
  { day: "Fri", calories: 0 },
  { day: "Sat", calories: 640 },
  { day: "Sun", calories: 0 },
];

const maxCalories = Math.max(...WEEKLY_ACTIVITY.map((d) => d.calories));

export default function CoachClients() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const client = MOCK_CLIENTS.find((c) => c.id === selectedId);

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
              className={
                "hh-nav-link" + (item.active ? " hh-nav-link--active" : "")
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          {/* Header */}
          <div>
            <h1 className="hh-page-title">MY CLIENTS</h1>
            <p className="hh-page-subtitle">
              {MOCK_CLIENTS.length} active clients
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "var(--hh-sp-24)",
            }}
          >
            {/* Client list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MOCK_CLIENTS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="hh-card"
                  style={{
                    cursor: "pointer",
                    borderColor:
                      selectedId === c.id ? "var(--hh-accent)" : undefined,
                    background:
                      selectedId === c.id ? "var(--hh-accent-15)" : undefined,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--hh-bg-card-dark)",
                        border: "1px solid var(--hh-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontFamily: "var(--hh-font-display)",
                        fontSize: "var(--hh-fs-16)",
                        fontWeight: 700,
                        color: "var(--hh-accent-light)",
                      }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "var(--hh-fs-14)",
                          fontWeight: 600,
                          color: "var(--hh-text-primary)",
                        }}
                      >
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--hh-fs-12)",
                          color: "var(--hh-text-muted)",
                        }}
                      >
                        {c.goal}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "var(--hh-fs-12)",
                        color: "var(--hh-text-muted)",
                      }}
                    >
                      {c.lastActive}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "var(--hh-fs-12)",
                        color: "var(--hh-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      <span>Progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "var(--hh-bg-card-dark)",
                        borderRadius: 9999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${c.progress}%`,
                          background: "var(--hh-accent)",
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Client detail */}
            <div>
              {client ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--hh-sp-16)",
                  }}
                >
                  {/* Client info card */}
                  <div className="hh-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "var(--hh-bg-card-dark)",
                          border: "1px solid var(--hh-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontFamily: "var(--hh-font-display)",
                          fontSize: "var(--hh-fs-22)",
                          fontWeight: 700,
                          color: "var(--hh-accent-light)",
                        }}
                      >
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: "var(--hh-font-display)",
                            fontSize: "var(--hh-fs-22)",
                            fontWeight: 800,
                            color: "var(--hh-text-primary)",
                          }}
                        >
                          {client.name}
                        </h3>
                        <p
                          style={{
                            fontSize: "var(--hh-fs-14)",
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          Goal: {client.goal} · Last active: {client.lastActive}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 16,
                        textAlign: "center",
                        padding: 16,
                        borderRadius: "var(--hh-radius-md)",
                        background: "var(--hh-bg-card-dark)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--hh-font-display)",
                            fontSize: "var(--hh-fs-22)",
                            fontWeight: 800,
                            color: "var(--hh-text-primary)",
                          }}
                        >
                          23
                        </div>
                        <div
                          style={{
                            fontSize: "var(--hh-fs-12)",
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          Workouts
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--hh-font-display)",
                            fontSize: "var(--hh-fs-22)",
                            fontWeight: 800,
                            color: "var(--hh-text-primary)",
                          }}
                        >
                          {client.progress}%
                        </div>
                        <div
                          style={{
                            fontSize: "var(--hh-fs-12)",
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          Progress
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--hh-font-display)",
                            fontSize: "var(--hh-fs-22)",
                            fontWeight: 800,
                            color: "var(--hh-text-primary)",
                          }}
                        >
                          12
                        </div>
                        <div
                          style={{
                            fontSize: "var(--hh-fs-12)",
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          Day Streak
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity chart */}
                  <div className="hh-card">
                    <h4 className="hh-panel-heading">Activity This Week</h4>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-around",
                        height: 120,
                        gap: 8,
                      }}
                    >
                      {WEEKLY_ACTIVITY.map((bar) => (
                        <div
                          key={bar.day}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
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
                            {bar.calories > 0 && (
                              <div
                                style={{
                                  width: "100%",
                                  maxWidth: 32,
                                  height: `${(bar.calories / maxCalories) * 100}%`,
                                  background: "var(--hh-accent)",
                                  borderRadius: "4px 4px 0 0",
                                  minHeight: 6,
                                }}
                              />
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "var(--hh-fs-11)",
                              color: "var(--hh-text-muted)",
                            }}
                          >
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="hh-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 192,
                  }}
                >
                  <p
                    style={{
                      fontSize: "var(--hh-fs-14)",
                      color: "var(--hh-text-muted)",
                    }}
                  >
                    Select a client to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
