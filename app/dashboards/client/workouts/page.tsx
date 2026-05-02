"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Dumbbell } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, ClientWorkoutPlan } from "@/services/clientDashboardService";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { useAuthStore } from "@/store/authStore";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active:    { bg: "rgba(34, 197, 94, 0.1)",   color: "var(--hh-text-green)" },
  inactive:  { bg: "rgba(156, 163, 175, 0.1)", color: "var(--hh-text-muted)" },
  completed: { bg: "rgba(59, 130, 246, 0.1)",  color: "#3b82f6" },
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function humanize(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type BuiltExercise = { name: string; sets: number; reps: string; rest: string };

function parseExercisesFromDescription(description: string | null): { days: string[]; exercises: BuiltExercise[] } {
  if (!description) return { days: [], exercises: [] };
  const lines = description.split("\n").map((l) => l.trim()).filter(Boolean);
  const daysLine = lines.find((l) => l.startsWith("Assigned days:"));
  const days = daysLine
    ? daysLine.replace("Assigned days:", "").split(",").map((d) => d.trim()).filter(Boolean)
    : [];
  const exercises: BuiltExercise[] = lines
    .filter((l) => /^\d+\./.test(l))
    .map((line) => ({
      name: line.match(/^\d+\.\s+(.+?)\s+-\s+/)?.[1] ?? line,
      sets: Number(line.match(/(\d+)\s+sets/)?.[1] ?? 3),
      reps: line.match(/x\s+([\d\-–]+)/)?.[1] ?? "8-12",
      rest: line.match(/rest\s+(\S+)/)?.[1] ?? "60s",
    }));
  return { days, exercises };
}

export default function MyWorkoutsPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  const [plans, setPlans] = useState<ClientWorkoutPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState<ClientWorkoutPlan | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Exercise library
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");

  // Builder
  const [showBuilder, setShowBuilder] = useState(false);
  const [planName, setPlanName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<BuiltExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) { setLoadingPlans(false); return; }
    clientDashboardService.getMyWorkoutPlans(Number(userId))
      .then((d) => setPlans(d.workout_plans))
      .finally(() => setLoadingPlans(false));
  }, [userId]);

  useEffect(() => {
    exerciseService.getAll()
      .then((d) => setLibrary(d.exercises))
      .catch(() => setLibrary([]))
      .finally(() => setLoadingLibrary(false));
  }, []);

  const isDefined = (v: string | undefined): v is string => v !== undefined && v !== null;
  const muscleGroups   = ["All", ...Array.from(new Set(library.map((e) => e.muscle_group).filter(isDefined)))];
  const equipmentTypes = ["All", ...Array.from(new Set(library.map((e) => e.equipment_type).filter(isDefined)))];

  const filteredLibrary = library.filter((e) => {
    const matchSearch    = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle    = muscleFilter    === "All" || e.muscle_group   === muscleFilter;
    const matchEquipment = equipmentFilter === "All" || e.equipment_type === equipmentFilter;
    return matchSearch && matchMuscle && matchEquipment;
  });

  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);
  const counts = {
    all:       plans.length,
    active:    plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

  const addExercise = (name: string) => {
    if (exercises.find((e) => e.name === name)) return;
    setExercises((prev) => [...prev, { name, sets: 3, reps: "8-12", rest: "60s" }]);
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleSavePlan = () => {
    if (!userId)            { setStatusMessage("Sign in before creating a plan."); return; }
    if (!planName.trim())   { setStatusMessage("Plan name is required."); return; }
    if (!exercises.length)  { setStatusMessage("Add at least one exercise."); return; }

    setIsSaving(true);
    const description = [
      selectedDays.length ? `Assigned days: ${selectedDays.join(", ")}` : "Assigned days: None selected",
      "",
      ...exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.sets} sets x ${ex.reps}, rest ${ex.rest}`),
    ].join("\n");

    const plan = clientDashboardService.createMyWorkoutPlan(Number(userId), {
      name: planName.trim(), description, status: "active",
    });
    setPlans((prev) => [plan, ...prev]);
    setPlanName(""); setSelectedDays([]); setExercises([]);
    setShowBuilder(false); setStatusMessage("Workout plan created.");
    setIsSaving(false);
  };

  const updateLocalStatus = (plan: ClientWorkoutPlan, status: ClientWorkoutPlan["status"]) => {
    if (!userId || plan.source !== "client") return;
    const updated = clientDashboardService.updateMyWorkoutPlan(Number(userId), plan.plan_id, { status });
    if (!updated) return;
    setPlans((prev) => prev.map((p) => p.plan_id === updated.plan_id ? updated : p));
    setSelectedPlan(updated);
  };

  const deleteLocalPlan = (plan: ClientWorkoutPlan) => {
    if (!userId || plan.source !== "client") return;
    clientDashboardService.deleteMyWorkoutPlan(Number(userId), plan.plan_id);
    setPlans((prev) => prev.filter((p) => p.plan_id !== plan.plan_id));
    setSelectedPlan(null);
    setStatusMessage("Plan deleted.");
  };

  return (
    <div className="hh-dash-root">
      {/* Plan detail modal */}
      {selectedPlan && (() => {
        const parsed = parseExercisesFromDescription(selectedPlan.description);
        return (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
            onClick={() => setSelectedPlan(null)}>
            <div className="hh-card" style={{ width: 560, maxHeight: "80vh", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--hh-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>🏋️ {selectedPlan.name}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>by {selectedPlan.coach_name}</p>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[selectedPlan.status]?.bg, color: STATUS_STYLES[selectedPlan.status]?.color }}>
                    {selectedPlan.status}
                  </span>
                </div>
                {parsed.days.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {parsed.days.map((d) => (
                      <span key={d} style={{ padding: "2px 10px", borderRadius: 12, fontSize: 12, border: "1px solid var(--hh-accent)", color: "var(--hh-accent-light)" }}>{d}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {parsed.exercises.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {parsed.exercises.map((ex, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 8, background: "var(--hh-bg-card-dark)" }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--hh-accent-20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--hh-accent-light)", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                        <div style={{ display: "flex", gap: 16 }}>
                          {[{ label: "Sets", val: ex.sets }, { label: "Reps", val: ex.reps }, { label: "Rest", val: ex.rest }].map((m) => (
                            <div key={m.label} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.val}</div>
                              <div style={{ fontSize: 10, color: "var(--hh-text-muted)" }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedPlan.description ? (
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selectedPlan.description}</p>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--hh-text-muted)", fontStyle: "italic" }}>No description provided</p>
                )}
                <p style={{ margin: "16px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                  Created: {new Date(selectedPlan.created_at).toLocaleDateString()}
                </p>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                {selectedPlan.source === "client" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateLocalStatus(selectedPlan, selectedPlan.status === "completed" ? "active" : "completed")} className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)" }}>
                      {selectedPlan.status === "completed" ? "Mark Active" : "Mark Completed"}
                    </button>
                    <button onClick={() => deleteLocalPlan(selectedPlan)} className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", color: "var(--hh-error)" }}>Delete</button>
                  </div>
                ) : <span />}
                <button onClick={() => setSelectedPlan(null)} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md"><Dumbbell size={16} color="white" /></div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">Sign Out</SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="hh-page-title">MY WORKOUTS</h1>
              <p className="hh-page-subtitle">View plans from your coach or build your own</p>
            </div>
            <button className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowBuilder((v) => !v)}>
              <Plus size={14} /> {showBuilder ? "Hide Builder" : "New Plan"}
            </button>
          </div>

          {statusMessage && <p className="hh-text-green" style={{ margin: 0 }}>{statusMessage}</p>}

          {/* Plan builder */}
          {showBuilder && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--hh-sp-24)" }}>
              {/* Left: builder form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="hh-card">
                  <div className="hh-field" style={{ marginBottom: 16 }}>
                    <label className="hh-field__label">Plan Name</label>
                    <div className="hh-input-wrap">
                      <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="My Strength Plan" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="hh-field__label" style={{ display: "block", marginBottom: 8 }}>Training Days</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {DAYS_OF_WEEK.map((day) => (
                        <button key={day} onClick={() => toggleDay(day)} style={{
                          padding: "4px 10px", borderRadius: "var(--hh-radius-full)", fontSize: "var(--hh-fs-11)",
                          fontWeight: 500, border: "1px solid", cursor: "pointer", fontFamily: "var(--hh-font-body)",
                          borderColor: selectedDays.includes(day) ? "var(--hh-accent)" : "var(--hh-border)",
                          background: selectedDays.includes(day) ? "var(--hh-accent-20)" : "transparent",
                          color: selectedDays.includes(day) ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                        }}>{day.slice(0, 3)}</button>
                      ))}
                    </div>
                    {selectedDays.length > 0 && (
                      <p style={{ fontSize: 11, color: "var(--hh-text-muted)", marginTop: 6 }}>
                        Assigned to: {selectedDays.join(", ")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <h4 className="hh-panel-heading" style={{ marginBottom: 0 }}>Exercises</h4>
                      <span style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>{exercises.length} added</span>
                    </div>
                    {exercises.length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--hh-text-muted)", marginBottom: 16 }}>Pick exercises from the library →</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                        {exercises.map((ex, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, background: "var(--hh-bg-card-dark)" }}>
                            <span style={{ flex: 1, fontSize: "var(--hh-fs-14)", fontWeight: 500 }}>{ex.name}</span>
                            <input type="number" defaultValue={ex.sets} title="Sets"
                              style={{ width: 40, height: 26, textAlign: "center", background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)", borderRadius: 6, fontSize: 12, color: "var(--hh-text-primary)" }} />
                            <span style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>sets</span>
                            <input defaultValue={ex.reps} title="Reps"
                              style={{ width: 44, height: 26, textAlign: "center", background: "var(--hh-bg-card)", border: "1px solid var(--hh-border)", borderRadius: 6, fontSize: 12, color: "var(--hh-text-primary)" }} />
                            <span style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>reps</span>
                            <button onClick={() => removeExercise(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                              <Trash2 size={14} color="var(--hh-text-muted)" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn btn--primary" style={{ width: "100%" }} onClick={handleSavePlan} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Plan"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: exercise library from DB */}
              <div className="hh-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 className="hh-panel-heading">Exercise Library</h3>
                <div className="hh-input-wrap">
                  <Search size={16} color="var(--hh-text-muted)" style={{ position: "absolute", left: 12 }} />
                  <input type="text" className="hh-input" placeholder="Search exercises..."
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div>
                  <p style={{ fontSize: 11, color: "var(--hh-text-muted)", marginBottom: 6, fontWeight: 500 }}>MUSCLE GROUP</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {muscleGroups.map((mg) => (
                      <button key={mg} onClick={() => setMuscleFilter(mg)} style={{
                        padding: "3px 9px", borderRadius: "var(--hh-radius-full)", fontSize: 11, fontWeight: 500,
                        border: "1px solid", cursor: "pointer", fontFamily: "var(--hh-font-body)",
                        borderColor: muscleFilter === mg ? "var(--hh-accent)" : "var(--hh-border)",
                        background: muscleFilter === mg ? "var(--hh-accent-20)" : "transparent",
                        color: muscleFilter === mg ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                      }}>{humanize(mg)}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 11, color: "var(--hh-text-muted)", marginBottom: 6, fontWeight: 500 }}>EQUIPMENT</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {equipmentTypes.map((eq) => (
                      <button key={eq} onClick={() => setEquipmentFilter(eq)} style={{
                        padding: "3px 9px", borderRadius: "var(--hh-radius-full)", fontSize: 11, fontWeight: 500,
                        border: "1px solid", cursor: "pointer", fontFamily: "var(--hh-font-body)",
                        borderColor: equipmentFilter === eq ? "var(--hh-accent)" : "var(--hh-border)",
                        background: equipmentFilter === eq ? "var(--hh-accent-20)" : "transparent",
                        color: equipmentFilter === eq ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                      }}>{humanize(eq)}</button>
                    ))}
                  </div>
                </div>

                {loadingLibrary ? (
                  <p style={{ fontSize: 13, color: "var(--hh-text-muted)" }}>Loading exercises...</p>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>
                      {filteredLibrary.length} exercise{filteredLibrary.length !== 1 ? "s" : ""} found
                    </p>
                    <div style={{ flex: 1, overflowY: "auto", maxHeight: 300, display: "flex", flexDirection: "column", gap: 4 }}>
                      {filteredLibrary.map((ex) => {
                        const added = exercises.some((e) => e.name === ex.name);
                        return (
                          <div key={ex.e_id} onClick={() => addExercise(ex.name)} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 12px", borderRadius: 8, cursor: added ? "default" : "pointer",
                            opacity: added ? 0.5 : 1, transition: "background 0.15s",
                          }}
                            onMouseEnter={(e) => { if (!added) e.currentTarget.style.background = "var(--hh-bg-card-dark)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                              <div style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>
                                {humanize(ex.muscle_group ?? "")} · {humanize(ex.equipment_type ?? "")}
                                {ex.difficulty ? ` · ${humanize(ex.difficulty)}` : ""}
                              </div>
                            </div>
                            {added ? (
                              <span style={{ fontSize: 11, color: "var(--hh-accent-light)" }}>Added</span>
                            ) : (
                              <Plus size={14} color="var(--hh-accent-light)" />
                            )}
                          </div>
                        );
                      })}
                      {filteredLibrary.length === 0 && (
                        <p style={{ fontSize: 13, color: "var(--hh-text-muted)", padding: "12px 0" }}>No exercises match your filters.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Total Plans", value: counts.all,       color: "var(--hh-text-primary)", key: "all"       },
              { label: "Active",      value: counts.active,    color: "var(--hh-text-green)",   key: "active"    },
              { label: "Completed",   value: counts.completed, color: "#3b82f6",                key: "completed" },
            ].map((stat) => (
              <div key={stat.key} onClick={() => setFilter(stat.key)} className="hh-card" style={{ padding: 20, textAlign: "center", cursor: "pointer", border: filter === stat.key ? `2px solid ${stat.color}` : "2px solid transparent" }}>
                <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Plans list */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {filter === "all" ? "All Workout Plans" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Plans`}
              </h3>
            </div>
            {loadingPlans ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading...</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>
                {plans.length === 0 ? "No workout plans yet. Connect with a coach or build your own!" : "No plans match this filter."}
              </p>
            ) : (
              filtered.map((plan) => {
                const parsed = parseExercisesFromDescription(plan.description);
                return (
                  <div key={plan.plan_id} onClick={() => setSelectedPlan(plan)} style={{ padding: 20, borderBottom: "1px solid var(--hh-border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{plan.name}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>{plan.coach_name}</p>
                      {parsed.exercises.length > 0 && (
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                          {parsed.exercises.length} exercise{parsed.exercises.length !== 1 ? "s" : ""}
                          {parsed.days.length > 0 ? ` · ${parsed.days.join(", ")}` : ""}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {plan.source === "client" && <span className="hh-badge hh-badge--sm">Your Plan</span>}
                      <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[plan.status]?.bg, color: STATUS_STYLES[plan.status]?.color }}>
                        {plan.status}
                      </span>
                      <span style={{ color: "var(--hh-text-muted)" }}>→</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
