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
  { id: "1", name: "Alex Morgan"   },
  { id: "2", name: "Sam Chen"      },
  { id: "3", name: "Taylor Kim"    },
  { id: "4", name: "Morgan Davis"  },
];

const EXERCISE_LIBRARY = [
  { id: "e1",  name: "Bench Press",        muscleGroup: "Chest",     equipment: "Barbell"    },
  { id: "e2",  name: "Squat",              muscleGroup: "Legs",      equipment: "Barbell"    },
  { id: "e3",  name: "Deadlift",           muscleGroup: "Back",      equipment: "Barbell"    },
  { id: "e4",  name: "Overhead Press",     muscleGroup: "Shoulders", equipment: "Barbell"    },
  { id: "e5",  name: "Pull Up",            muscleGroup: "Back",      equipment: "Bodyweight" },
  { id: "e6",  name: "Dumbbell Curl",      muscleGroup: "Arms",      equipment: "Dumbbell"   },
  { id: "e7",  name: "Tricep Pushdown",    muscleGroup: "Arms",      equipment: "Cable"      },
  { id: "e8",  name: "Leg Press",          muscleGroup: "Legs",      equipment: "Machine"    },
  { id: "e9",  name: "Incline DB Press",   muscleGroup: "Chest",     equipment: "Dumbbell"   },
  { id: "e10", name: "Cable Row",          muscleGroup: "Back",      equipment: "Cable"      },
  { id: "e11", name: "Lateral Raise",      muscleGroup: "Shoulders", equipment: "Dumbbell"   },
  { id: "e12", name: "Leg Curl",           muscleGroup: "Legs",      equipment: "Machine"    },
  { id: "e13", name: "Push Up",            muscleGroup: "Chest",     equipment: "Bodyweight" },
  { id: "e14", name: "Plank",              muscleGroup: "Core",      equipment: "Bodyweight" },
  { id: "e15", name: "Russian Twist",      muscleGroup: "Core",      equipment: "Bodyweight" },
  { id: "e16", name: "Hip Thrust",         muscleGroup: "Glutes",    equipment: "Barbell"    },
  { id: "e17", name: "Romanian Deadlift",  muscleGroup: "Glutes",    equipment: "Barbell"    },
  { id: "e18", name: "Calf Raise",         muscleGroup: "Legs",      equipment: "Machine"    },
];

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Glutes"];
const EQUIPMENT_TYPES = ["All", "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"];
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Exercise = { name: string; sets: number; reps: string; rest: string };

export default function CoachWorkouts() {
  const [planName, setPlanName] = useState("4-Week Strength Program");
  const [selectedClientId, setSelectedClientId] = useState("1");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [saved, setSaved] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: "Bench Press",      sets: 4, reps: "6-8",   rest: "90s" },
    { name: "Overhead Press",   sets: 3, reps: "8-10",  rest: "90s" },
    { name: "Incline DB Press", sets: 3, reps: "10-12", rest: "60s" },
  ]);

  const selectedClient = MOCK_CLIENTS.find((c) => c.id === selectedClientId);

  const filtered = EXERCISE_LIBRARY.filter((e) => {
    const matchSearch    = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle    = muscleFilter    === "All" || e.muscleGroup === muscleFilter;
    const matchEquipment = equipmentFilter === "All" || e.equipment   === equipmentFilter;
    return matchSearch && matchMuscle && matchEquipment;
  });

  const addExercise = (name: string) => {
    if (exercises.find((e) => e.name === name)) return;
    setExercises((prev) => [...prev, { name, sets: 3, reps: "8-12", rest: "60s" }]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            <p className="hh-page-subtitle">
              {selectedClient ? `Creating plan for ${selectedClient.name}` : "Create and assign programs to your clients"}
            </p>
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

                <div className="hh-field" style={{ marginBottom: 16 }}>
                  <label className="hh-field__label">Assign to Client</label>
                  <select
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    style={{ appearance: "auto" }}
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                  >
                    {MOCK_CLIENTS.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Day assignment */}
                <div>
                  <label className="hh-field__label" style={{ display: "block", marginBottom: 8 }}>
                    Assign to Days
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "var(--hh-radius-full)",
                          fontSize: "var(--hh-fs-11)",
                          fontWeight: 500,
                          border: "1px solid",
                          cursor: "pointer",
                          fontFamily: "var(--hh-font-body)",
                          borderColor: selectedDays.includes(day) ? "var(--hh-accent)" : "var(--hh-border)",
                          background: selectedDays.includes(day) ? "var(--hh-accent-20)" : "transparent",
                          color: selectedDays.includes(day) ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                          transition: "all 0.15s",
                        }}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length > 0 && (
                    <p style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)", marginTop: 6 }}>
                      Assigned to: {selectedDays.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Exercises */}
              <div className="hh-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h3 className="hh-panel-heading" style={{ marginBottom: 0 }}>Exercises</h3>
                  <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                    {exercises.length} added
                  </span>
                </div>

                {exercises.length === 0 ? (
                  <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)", marginBottom: 16 }}>
                    No exercises added yet. Pick from the library →
                  </p>
                ) : (
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
                          title="Sets"
                          style={{
                            width: 44, height: 28, textAlign: "center",
                            background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                            borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                          }}
                        />
                        <span style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)" }}>sets</span>
                        <input
                          defaultValue={ex.reps}
                          title="Reps"
                          style={{
                            width: 48, height: 28, textAlign: "center",
                            background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                            borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                          }}
                        />
                        <span style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)" }}>reps</span>
                        <input
                          defaultValue={ex.rest}
                          title="Rest"
                          style={{
                            width: 44, height: 28, textAlign: "center",
                            background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)",
                            borderRadius: 6, fontSize: "var(--hh-fs-12)", color: "var(--hh-text-primary)",
                          }}
                        />
                        <button
                          onClick={() => removeExercise(i)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                        >
                          <Trash2 size={16} color="var(--hh-text-muted)" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    className="btn btn--primary"
                    style={{ flex: 1 }}
                    onClick={handleSave}
                  >
                    {saved ? "✓ Assigned!" : `Save & Assign to ${selectedClient?.name ?? "Client"}`}
                  </button>
                  <button className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)" }}>
                    Save Draft
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise library */}
            <div className="hh-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 className="hh-panel-heading">Exercise Library</h3>

              {/* Search */}
              <div className="hh-input-wrap">
                <Search size={16} color="var(--hh-text-muted)" style={{ position: "absolute", left: 12 }} />
                <input
                  type="text"
                  className="hh-input"
                  placeholder="Search exercises..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Muscle group filter */}
              <div>
                <p style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)", marginBottom: 6, fontWeight: 500 }}>
                  MUSCLE GROUP
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {MUSCLE_GROUPS.map((mg) => (
                    <button
                      key={mg}
                      onClick={() => setMuscleFilter(mg)}
                      style={{
                        padding: "3px 10px", borderRadius: "var(--hh-radius-full)",
                        fontSize: "var(--hh-fs-11)", fontWeight: 500,
                        border: "1px solid", cursor: "pointer",
                        fontFamily: "var(--hh-font-body)",
                        borderColor: muscleFilter === mg ? "var(--hh-accent)" : "var(--hh-border)",
                        background: muscleFilter === mg ? "var(--hh-accent-20)" : "transparent",
                        color: muscleFilter === mg ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                        transition: "all 0.15s",
                      }}
                    >
                      {mg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment filter */}
              <div>
                <p style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)", marginBottom: 6, fontWeight: 500 }}>
                  EQUIPMENT
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EQUIPMENT_TYPES.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setEquipmentFilter(eq)}
                      style={{
                        padding: "3px 10px", borderRadius: "var(--hh-radius-full)",
                        fontSize: "var(--hh-fs-11)", fontWeight: 500,
                        border: "1px solid", cursor: "pointer",
                        fontFamily: "var(--hh-font-body)",
                        borderColor: equipmentFilter === eq ? "var(--hh-accent)" : "var(--hh-border)",
                        background: equipmentFilter === eq ? "var(--hh-accent-20)" : "transparent",
                        color: equipmentFilter === eq ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                        transition: "all 0.15s",
                      }}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                {filtered.length} exercise{filtered.length !== 1 ? "s" : ""} found
              </p>

              {/* Exercise list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 380 }}>
                {filtered.map((ex) => {
                  const alreadyAdded = exercises.some((e) => e.name === ex.name);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => addExercise(ex.name)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", borderRadius: "var(--hh-radius-md)",
                        cursor: alreadyAdded ? "default" : "pointer",
                        transition: "background 0.15s",
                        opacity: alreadyAdded ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!alreadyAdded) e.currentTarget.style.background = "var(--hh-bg-card-dark)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 500, color: "var(--hh-text-primary)" }}>
                          {ex.name}
                        </div>
                        <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                          {ex.muscleGroup} · {ex.equipment}
                        </div>
                      </div>
                      {alreadyAdded ? (
                        <span style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-accent-light)" }}>Added</span>
                      ) : (
                        <Plus size={16} color="var(--hh-accent-light)" />
                      )}
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)", padding: "12px 0" }}>
                    No exercises match your filters.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
