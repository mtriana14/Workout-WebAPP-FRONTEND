"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Dumbbell } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { clientRequestService } from "@/services/ClientRequest";
import { workoutPlanService } from "@/services/workoutPlanService";
import { exerciseService, Exercise } from "@/services/exerciseService";
import { useAuthStore } from "@/store/authStore";

interface CoachClientOption {
  id: number;
  name: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function humanize(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const isDefined = (v: string | undefined): v is string => v !== undefined && v !== null;

export default function CoachWorkouts() {
  const user = useAuthStore((state) => state.user);
  const coachUserId = user?.id ?? user?.user_id;
  const [planName, setPlanName] = useState("4-Week Strength Program");
  const [clients, setClients] = useState<CoachClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipmentFilter, setEquipmentFilter] = useState("All");
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [exercises, setExercises] = useState<{ name: string; sets: number; reps: string; rest: string }[]>([
    { name: "Bench Press",      sets: 4, reps: "6-8",   rest: "90s" },
    { name: "Overhead Press",   sets: 3, reps: "8-10",  rest: "90s" },
    { name: "Incline DB Press", sets: 3, reps: "10-12", rest: "60s" },
  ]);

  useEffect(() => {
    if (!coachUserId) {
      setLoadingClients(false);
      return;
    }

    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const response = await clientRequestService.getAll(coachUserId);
        const acceptedClients = (response.requests ?? [])
          .filter((request) => request.status === "accepted")
          .map((request) => ({
            id: request.client_id,
            name: request.client_name ?? `Client #${request.client_id}`,
          }));

        const uniqueClients = acceptedClients.filter(
          (client, index, array) => array.findIndex((item) => item.id === client.id) === index,
        );

        setClients(uniqueClients);
        setSelectedClientId((current) => current || String(uniqueClients[0]?.id ?? ""));
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : "Failed to load connected clients.",
          type: "error",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    void loadClients();
  }, [coachUserId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    exerciseService.getAll()
      .then((d) => setLibrary(d.exercises))
      .catch(() => setLibrary([]))
      .finally(() => setLoadingLibrary(false));
  }, []);

  const selectedClient = clients.find((c) => String(c.id) === selectedClientId);

  const muscleGroups   = ["All", ...Array.from(new Set(library.map((e) => e.muscle_group).filter(isDefined)))];
  const equipmentTypes = ["All", ...Array.from(new Set(library.map((e) => e.equipment_type).filter(isDefined)))];

  const filtered = library.filter((e) => {
    const matchSearch    = e.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle    = muscleFilter    === "All" || e.muscle_group   === muscleFilter;
    const matchEquipment = equipmentFilter === "All" || e.equipment_type === equipmentFilter;
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

  const handleSave = async () => {
    if (!coachUserId) {
      setToast({ message: "You need to be signed in as a coach.", type: "error" });
      return;
    }

    if (!selectedClientId) {
      setToast({ message: "Connect with a client before assigning a workout plan.", type: "error" });
      return;
    }

    if (!planName.trim()) {
      setToast({ message: "Workout plan name is required.", type: "error" });
      return;
    }

    const descriptionLines = [
      selectedDays.length ? `Assigned days: ${selectedDays.join(", ")}` : "Assigned days: None selected",
      "",
      ...exercises.map((exercise, index) => `${index + 1}. ${exercise.name} - ${exercise.sets} sets x ${exercise.reps}, rest ${exercise.rest}`),
    ];

    try {
      setIsSaving(true);
      await workoutPlanService.create(coachUserId, {
        client_id: Number(selectedClientId),
        name: planName.trim(),
        description: descriptionLines.join("\n"),
      });
      setSaved(true);
      setToast({ message: `Workout plan assigned to ${selectedClient?.name ?? "client"}.`, type: "success" });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to assign workout plan.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="hh-dash-root">
      {toast ? (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 8, backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)", color: "white", fontSize: 14, fontWeight: 500, zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.message}
        </div>
      ) : null}

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

        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
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
                    disabled={loadingClients || clients.length === 0}
                  >
                    {loadingClients ? <option value="">Loading connected clients...</option> : null}
                    {!loadingClients && clients.length === 0 ? <option value="">No connected clients yet</option> : null}
                    {!loadingClients && clients.length > 0
                      ? clients.map((client) => (
                          <option key={client.id} value={String(client.id)}>{client.name}</option>
                        ))
                      : null}
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
                    disabled={isSaving || loadingClients || clients.length === 0}
                  >
                    {isSaving ? "Saving..." : saved ? "✓ Assigned!" : `Save & Assign to ${selectedClient?.name ?? "Client"}`}
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
                  {muscleGroups.map((mg) => (
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
                      {humanize(mg)}
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
                  {equipmentTypes.map((eq) => (
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
                      {humanize(eq)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results count */}
              {loadingLibrary ? (
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Loading exercises...</p>
              ) : (
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                  {filtered.length} exercise{filtered.length !== 1 ? "s" : ""} found
                </p>
              )}

              {/* Exercise list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: 380 }}>
                {filtered.map((ex) => {
                  const alreadyAdded = exercises.some((e) => e.name === ex.name);
                  return (
                    <div
                      key={ex.e_id}
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
                          {humanize(ex.muscle_group ?? "")} · {humanize(ex.equipment_type ?? "")}
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
                {!loadingLibrary && filtered.length === 0 && (
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
