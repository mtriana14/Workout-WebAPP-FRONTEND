"use client";

import { PlayCircle, Plus } from "lucide-react";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric"
});

const STAT_CARDS = [
  { label: "Calories Today",     value: "2,140", delta: "↑ 340 left",         deltaClass: "hh-text-green",  sub: "Target: 3,200 kcal"   },
  { label: "Daily Steps",        value: "7,842", delta: "↑ 78%",              deltaClass: "hh-text-green",  sub: "Target: 10,000 steps" },
  { label: "Active Calories",    value: "384",   delta: "↑ 12% vs yesterday", deltaClass: "hh-text-green",  sub: "Burned today"         },
  { label: "Workouts This Week", value: "3",     delta: "Goal: 4 sessions",   deltaClass: "hh-text-muted",  sub: ""                     },
];

const WORKOUT_EXERCISES = [
  { name: "Bench Press",      detail: "4×6-8 @ 185 lbs"   },
  { name: "Overhead Press",   detail: "3×8-10 @ 115 lbs"  },
  { name: "Incline DB Press", detail: "3×10-12 @ 65 lbs"  },
  { name: "Tricep Pushdown",  detail: "3×12-15 @ 50 lbs"  },
];

const WEEKLY_CALORIES = [
  { day: "Mon", calories: 320 },
  { day: "Tue", calories: 0   },
  { day: "Wed", calories: 480 },
  { day: "Thu", calories: 560 },
  { day: "Fri", calories: 0   },
  { day: "Sat", calories: 640 },
  { day: "Sun", calories: 0   },
];

const QUICK_LOGS = [
  { label: "Log Strength Training", href: "/dashboards/user/workouts"  },
  { label: "Log Cardio Session",    href: "/dashboards/user/workouts"  },
  { label: "Log Daily Steps",       href: "/dashboards/user/workouts"  },
  { label: "Log Meal Calories",     href: "/dashboards/user/nutrition" },
];

const MACROS = [
  { label: "Protein", current: 142, target: 220, color: "var(--hh-accent)"       },
  { label: "Carbs",   current: 280, target: 380, color: "var(--hh-accent-light)" },
  { label: "Fat",     current: 58,  target: 95,  color: "#f59e0b"                },
];

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboards/user",           active: true  },
  { label: "Workouts",  href: "/dashboards/user/workouts",  active: false },
  { label: "Nutrition", href: "/dashboards/user/nutrition", active: false },
  { label: "My Coach",  href: "/dashboards/user/coach",     active: false },
  { label: "Progress",  href: "/dashboards/user/progress",  active: false },
  { label: "Chat",      href: "/dashboards/user/chat",      active: false },
  { label: "Billing",   href: "/dashboards/user/billing",   active: false },
  { label: "Settings",  href: "/dashboards/user/settings",  active: false },
];

const maxCalories = Math.max(...WEEKLY_CALORIES.map((d) => d.calories));
const STEPS = 7842;
const STEPS_GOAL = 10000;
const STEPS_PCT = STEPS / STEPS_GOAL;
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function UserDashboard() {
  return (
    <div className="hh-dash-root">

      {/* SIDEBAR */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md" />
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">User Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="User navigation">
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
              <h1 className="hh-page-title">DASHBOARD</h1>
              <p className="hh-page-subtitle">{today}</p>
            </div>
            <button
              className="btn btn--primary"
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}
            >
              <Plus size={14} /> Log Activity
            </button>
          </div>

          {/* Welcome banner */}
          <div
            className="hh-card"
            style={{
              background: "linear-gradient(135deg, hsl(313 24% 20%), hsl(240 5% 14%))",
              border: "1px solid hsl(313 24% 46% / 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p className="hh-text-muted" style={{ fontSize: "var(--hh-fs-14)", marginBottom: 4 }}>
                Good morning 👋
              </p>
              <h2 style={{ fontFamily: "var(--hh-font-display)", fontWeight: 800, fontSize: "var(--hh-fs-30)", color: "var(--hh-text-primary)" }}>
                Alex Morgan
              </h2>
              <p className="hh-text-muted" style={{ fontSize: "var(--hh-fs-14)", marginTop: 4 }}>
                Today is a{" "}
                <span style={{ color: "var(--hh-accent-light)", fontWeight: 600 }}>Push Day</span>
                . Your coach has a workout ready.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-30)", fontWeight: 700, color: "var(--hh-accent-light)" }}>
                  12
                </div>
                <div className="hh-text-muted" style={{ fontSize: "var(--hh-fs-12)" }}>
                  Day Streak 🔥
                </div>
              </div>
              <button
                className="btn btn--primary"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <PlayCircle size={14} /> Start Workout
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="hh-stats-grid">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                </div>
                <p className="hh-card__value">{card.value}</p>
                {card.sub && (
                  <p className="hh-text-muted" style={{ fontSize: "var(--hh-fs-12)", marginTop: 2 }}>
                    {card.sub}
                  </p>
                )}
                <p className={"hh-card__delta " + card.deltaClass}>{card.delta}</p>
              </div>
            ))}
          </div>

          {/* Workout + Chart */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--hh-sp-24)" }}>

            {/* Today's workout */}
            <div className="hh-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 className="hh-panel-heading" style={{ marginBottom: 0 }}>Today&apos;s Workout</h3>
                <span className="hh-badge">Push Day</span>
              </div>
              <div>
                {WORKOUT_EXERCISES.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: i < WORKOUT_EXERCISES.length - 1 ? "0.6px solid var(--hh-border)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-primary)" }}>{ex.name}</span>
                    <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{ex.detail}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn btn--primary"
                style={{ width: "100%", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <PlayCircle size={14} /> Start Workout
              </button>
            </div>

            {/* Weekly calorie burn chart */}
            <div className="hh-card">
              <h3 className="hh-panel-heading">Weekly Calorie Burn</h3>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 180, gap: 8 }}>
                {WEEKLY_CALORIES.map((bar) => (
                  <div
                    key={bar.day}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, height: "100%", justifyContent: "flex-end" }}
                  >
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", flex: 1 }}>
                      {bar.calories > 0 && (
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 40,
                            height: `${(bar.calories / maxCalories) * 100}%`,
                            background: "var(--hh-accent)",
                            borderRadius: "6px 6px 0 0",
                            minHeight: 8,
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Steps + Quick Log + Macros */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--hh-sp-24)" }}>

            {/* Steps ring */}
            <div className="hh-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3 className="hh-panel-heading" style={{ alignSelf: "flex-start" }}>Daily Steps</h3>
              <div style={{ position: "relative", width: 128, height: 128 }}>
                <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="hsl(240 4% 18%)" strokeWidth="12" />
                  <circle
                    cx="64"
                    cy="64"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--hh-accent)"
                    strokeWidth="12"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - STEPS_PCT)}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-22)", fontWeight: 800, color: "var(--hh-text-primary)" }}>
                    7,842
                  </span>
                  <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>/ 10,000</span>
                </div>
              </div>
              <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 12 }}>
                78% of daily goal
              </p>
            </div>

            {/* Quick log */}
            <div className="hh-card">
              <h3 className="hh-panel-heading">Quick Log</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {QUICK_LOGS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "var(--hh-radius-md)",
                      fontSize: "var(--hh-fs-14)",
                      color: "var(--hh-text-primary)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hh-bg-card-dark)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span>{item.label}</span>
                    <Plus size={14} color="var(--hh-text-muted)" />
                  </a>
                ))}
              </div>
            </div>

            {/* Macros */}
            <div className="hh-card">
              <h3 className="hh-panel-heading">Today&apos;s Macros</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {MACROS.map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginBottom: 6 }}>
                      <span>{m.label}</span>
                      <span>{m.current}g / {m.target}g</span>
                    </div>
                    <div style={{ height: 8, background: "var(--hh-bg-card-dark)", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 9999,
                          width: `${(m.current / m.target) * 100}%`,
                          background: m.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
