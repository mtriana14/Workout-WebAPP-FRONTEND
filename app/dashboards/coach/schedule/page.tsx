"use client";

import { Dumbbell, Plus } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboards/coach",          active: false },
  { label: "My Clients",    href: "/dashboards/coach/clients",  active: false },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans",    href: "/dashboards/coach/meals",    active: false },
  { label: "Schedule",      href: "/dashboards/coach/schedule", active: true  },
  { label: "Chat",          href: "/dashboards/coach/chat",     active: false },
  { label: "Profile",       href: "/dashboards/coach/profile",  active: false },
  { label: "Settings",      href: "/dashboards/coach/settings", active: false },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 8;
  return `${hour}:00 ${hour < 12 ? "AM" : "PM"}`;
});

const BOOKED = [
  { day: "Mon", hour: 1, client: "Alex M."   },
  { day: "Wed", hour: 3, client: "Sam C."    },
  { day: "Fri", hour: 2, client: "Taylor K." },
];

const AVAILABLE = [
  { day: "Mon", hour: 0 },
  { day: "Mon", hour: 2 },
  { day: "Tue", hour: 1 },
  { day: "Thu", hour: 0 },
  { day: "Thu", hour: 2 },
  { day: "Sat", hour: 0 },
];

export default function CoachSchedule() {
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
        <div className="hh-dash-content">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 className="hh-page-title">SCHEDULE</h1>
              <p className="hh-page-subtitle">Set availability and view booked sessions</p>
            </div>
            <button
              className="btn btn--primary"
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
            >
              <Plus size={14} /> Add Availability
            </button>
          </div>

          {/* Calendar grid */}
          <div className="hh-card" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 600 }}>

              {/* Header row */}
              <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: 4, marginBottom: 8 }}>
                <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", padding: 8 }}>Time</div>
                {DAYS.map((d) => (
                  <div key={d} style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, textAlign: "center", padding: 8, color: "var(--hh-text-primary)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {HOURS.map((hour, hi) => (
                <div key={hi} style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", gap: 4, marginBottom: 4 }}>
                  <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", padding: 8, display: "flex", alignItems: "center" }}>
                    {hour}
                  </div>
                  {DAYS.map((day) => {
                    const isBooked  = BOOKED.find((b) => b.day === day && b.hour === hi);
                    const isAvail   = AVAILABLE.find((a) => a.day === day && a.hour === hi);

                    let bg      = "var(--hh-bg-card-dark)";
                    let color   = "transparent";
                    let border  = "1px solid transparent";
                    let label   = null;

                    if (isBooked) {
                      bg      = "var(--hh-accent-15)";
                      color   = "var(--hh-accent-light)";
                      border  = "1px solid var(--hh-accent-30)";
                      label   = isBooked.client;
                    } else if (isAvail) {
                      bg      = "rgba(74, 222, 128, 0.08)";
                      color   = "#4ade80";
                      border  = "1px solid rgba(74, 222, 128, 0.2)";
                      label   = "Open";
                    }

                    return (
                      <div
                        key={day}
                        style={{
                          height: 40, borderRadius: "var(--hh-radius-sm)",
                          background: bg, border,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "var(--hh-fs-10)", color, fontWeight: 500,
                          cursor: "pointer", transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
              ))}

            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 24, marginTop: 16, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: "var(--hh-accent-15)", border: "1px solid var(--hh-accent-30)" }} />
                Booked
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.2)" }} />
                Available
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
