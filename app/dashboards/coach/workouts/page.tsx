"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Dumbbell } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboards/coach",          active: false },
  { label: "My Clients",    href: "/dashboards/coach/clients",  active: false },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: true  },
  { label: "Meal Plans",    href: "/dashboards/coach/meals",    active: false },
  { label: "Schedule",      href: "/dashboards/coach/schedule", active: false },
  { label: "Chat",          href: "/dashboards/coach/chat",     active: false },
  { label: "Profile",       href: "/dashboards/coach/profile",  active: false },
  { label: "Settings",      href: "/dashboards/coach/settings", active: false },
];

const MOCK_CLIENTS = [
  { id: "1", name: "Alex Morgan"  },
  { id: "2", name: "Sam Chen"     },
  { id: "3", name: "Taylor Kim"   },
  { id: "4", name: "Morgan Davis" },
];

const EXERCISE_LIBRARY = [
  { id: "e1", name: "Bench Press",       muscleGroup: "Chest",     equipment: "Barbell" },
  { id: "e2", name: "Squat",             muscleGroup: "Legs",      equipment: "Barbell" },
  { id: "e3", name: "Deadlift",          muscleGroup: "Back",      equipment: "Barbell" },
  { id: "e4", name: "Overhead Press",    muscleGroup: "Shoulders", equipment: "Barbell" },
  { id: "e5", name: "Pull Up",           muscleGroup: "Back",      equipment: "Bodyweight" },
  { id: "e6", name: "Dumbbell Curl",     muscleGroup: "Arms",      equipment: "Dumbbell" },
  { id: "e7", name: "Tricep Pushdown",   muscleGroup: "Arms",      equipment: "Cable" },
  { id: "e8", name: "Leg Press",         muscleGroup: "Legs",      equipment: "Machine" },
  { id: "e9", name: "Incline DB Press",  muscleGroup: "Chest",     equipment: "Dumbbell" },
  { id: "e10", name: "Cable Row",        muscleGroup: "Back",      equipment: "Cable" },
];

type Exercise = { name: string; sets: number; reps: string; rest: string };

export default function CoachWorkouts() {
  const [planName, setPlanName] = useState("4-Week Strength Program");
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "Bench Press",     sets: 4, reps: "6-8",   rest: "90s" },
    { name: "Overhead Press",  sets: 3, reps: "8-10",  rest: "90s" },
    { name: "Incline DB Press",sets: 3, reps: "10-12", rest: "60s" },
  ]);

  const filtered = EXERCISE_LIBRARY.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const addExercise = (name: string) => {
    setExercises((prev) => [...prev, { name, sets: 3, reps: "8-12", rest: "60s" }]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
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
        <div className="hh-dash-content">

          {/* Header */}
          <div>
            <h1 className="hh-page-title">WORKOUT PLAN BUILDER</h1>
            <p className="hh-page-subtitle">Create and assign programs to your clients</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--hh-sp-24)" }}>

            {/* Builder side */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--hh-sp-16)" }}>

              {/* Plan info */}
              <div className="hh-card">
                <div className="hh-field" style={{ marginBottom: 16 }}>
                  <label className="hh-field__label">Plan Name</label>
                  <div className="hh-input-wrap">
                    <input
                      type="text"
                      className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="hh-field">
                  <label className="hh-field__label">Assign to Client</label>
                  <select
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    style={{ appearance: "auto" }}
                  >
                    {MOCK_CLIENTS.map((c) => (
                      <option key={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Exercises */}
              <div className="hh-card">
                <h3 className="hh-panel-heading">Exercises</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {exercises.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: 12, borderRadius: "var(--hh-radius-md)",
                        background: "var(--hh-bg-card-dark)",
                      }}
                    >
                      <span style={{ flex: 1, fontSize: "var(--hh-fs-14)", fontWeight: 500, color: "var(--hh-text-primary)" }}>
                        {ex.name}
                      </span>
                      <input
                        type="number"
                        defaultValue={ex.sets}
                        style={{
                          width: 44, height: 28, textAlign: "center",
                          background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                          borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                        }}
                      />
                      <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>×</span>
                      <input
                        defaultValue={ex.reps}
                        style={{
                          width: 48, height: 28, textAlign: "center",
                          background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                          borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                        }}
                      />
                      <input
                        defaultValue={ex.rest}
                        style={{
                          width: 44, height: 28, textAlign: "center",
                          background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                          borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                        }}
                      />
                      <button
                        onClick={() => removeExercise(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                        onMouseEnter={(e) => { (e.currentTarget.querySelector("svg") as SVGElement).style.color = "#f87171"; }}
                        onMouseLeave={(e) => { (e.currentTarget.querySelector("svg") as SVGElement).style.color = "var(--hh-text-muted)"; }}
                      >
                        <Trash2 size={16} color="var(--hh-text-muted)" />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn btn--primary" style={{ flex: 1 }}>Save &amp; Assign</button>
                  <button
                    className="btn btn--ghost"
                    style={{ border: "1px solid var(--hh-border)" }}
                  >
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise library */}
            <div className="hh-card">
              <h3 className="hh-panel-heading">Exercise Library</h3>

              {/* Search */}
              <div className="hh-input-wrap" style={{ marginBottom: 12 }}>
                <Search size={16} color="var(--hh-text-muted)" style={{ position: "absolute", left: 12 }} />
                <input
                  type="text"
                  className="hh-input"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {filtered.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => addExercise(ex.name)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", borderRadius: "var(--hh-radius-md)",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--hh-bg-card-dark)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div>
                      <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 500, color: "var(--hh-text-primary)" }}>
                        {ex.name}
                      </div>
                      <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                        {ex.muscleGroup} · {ex.equipment}
                      </div>
                    </div>
                    <Plus size={16} color="var(--hh-accent-light)" />
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
