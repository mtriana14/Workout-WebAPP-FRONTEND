"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { activityService } from "@/services/activityService";
import { exerciseService } from "@/services/exerciseService";
import { useAuthStore } from "@/store/authStore";

// Types for our workout data
type SetData = { reps: number | ""; weight: number | "" };
type Exercise = { id: number | null; name: string; muscleGroup: string; isCustom?: boolean };
type LoggedExercise = { exercise: Exercise; sets: SetData[] };

export default function LogStrengthWorkoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  // State Management
  const [plannedExercises, setPlannedExercises] = useState<Exercise[]>([]);
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>([]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [currentSets, setCurrentSets] = useState<SetData[]>([{ reps: "", weight: "" }]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [savingWorkout, setSavingWorkout] = useState(false);
  const [error, setError] = useState("");
  
  // UI Flow States
  const [isFinished, setIsFinished] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showLeavePrompt, setShowLeavePrompt] = useState(false);

  // Custom Exercise State
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("Chest");

  useEffect(() => {
    const loadExercises = async () => {
      try {
        setLoadingExercises(true);
        const response = await exerciseService.getAll();
        setPlannedExercises(
          response.exercises.map((exercise) => ({
            id: exercise.e_id ?? exercise.id ?? null,
            name: exercise.name,
            muscleGroup: exercise.muscle_group || "General",
          })),
        );
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load exercises.");
      } finally {
        setLoadingExercises(false);
      }
    };

    void loadExercises();
  }, []);

  // Native Browser Reload Protection (Alt Flow 2 partially)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isFinished && (loggedExercises.length > 0 || activeExercise)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isFinished, loggedExercises, activeExercise]);

  // Step 3: User selects an exercise
  const handleSelectExercise = (exercise: Exercise) => {
    setActiveExercise(exercise);
    // If they already logged sets for this load them back up to edit
    const existing = loggedExercises.find((le) => le.exercise.id === exercise.id && le.exercise.name === exercise.name);
    setCurrentSets(existing ? existing.sets : [{ reps: "", weight: "" }]);
  };

  // Step 5: User enters data and confirms the exercise
  const handleSaveExercise = () => {
    if (!activeExercise) return;
    
    // Filter out completely empty sets
    const validSets = currentSets.filter((s) => s.reps !== "" || s.weight !== "");
    
    setLoggedExercises((prev) => {
      const filtered = prev.filter((le) => !(le.exercise.id === activeExercise.id && le.exercise.name === activeExercise.name));
      return [...filtered, { exercise: activeExercise, sets: validSets }];
    });
    
    setActiveExercise(null); // Return to list (Step 6)
  };

  // Step 7 and 8: Finish Workout and show summary
  const handleFinishWorkout = async () => {
    setError("");

    if (!userId) {
      setError("Sign in before saving your workout.");
      return;
    }

    if (loggedExercises.length === 0) {
      setError("Log at least one exercise before finishing.");
      return;
    }

    try {
      setSavingWorkout(true);
      await Promise.all(
        loggedExercises.map((log) => {
          const validSets = log.sets.filter((set) => set.reps !== "" || set.weight !== "");
          const repsCompleted = validSets.reduce((sum, set) => sum + Number(set.reps || 0), 0);
          const heaviestWeight = validSets.reduce((max, set) => Math.max(max, Number(set.weight || 0)), 0);
          if (!log.exercise.id) {
            throw new Error("Custom exercises must be added to the exercise database before they can be logged.");
          }

          return activityService.logStrength({
            log_date: new Date().toISOString().slice(0, 10),
            exercise_id: log.exercise.id,
            sets_completed: validSets.length,
            reps_completed: repsCompleted,
            weight_used: heaviestWeight,
            notes: `${log.exercise.name} logged from strength workout page.`,
          });
        }),
      );
      setIsFinished(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save workout.");
    } finally {
      setSavingWorkout(false);
    }
  };

  // Alt Flow 1: Add Custom Exercise
  const handleSaveCustomExercise = () => {
    if (!customName.trim()) return;
    
    const newExercise: Exercise = {
      id: null,
      name: customName,
      muscleGroup: customMuscle,
      isCustom: true,
    };
    
    setPlannedExercises((prev) => [...prev, newExercise]);
    setShowCustomModal(false);
    setCustomName("");
    handleSelectExercise(newExercise); // Auto select to continue from Step 4
  };

  // Alt Flow 2: Leave Prompt Handlers
  const handleAttemptLeave = () => {
    if (loggedExercises.length === 0 && !activeExercise) {
      router.push("/dashboards/user");
    } else {
      setShowLeavePrompt(true);
    }
  };

  const handleLeaveAction = (action: "save" | "discard") => {
    setShowLeavePrompt(false);
    if (action === "save") {
      void handleFinishWorkout();
    }
    router.push("/dashboards/user");
  };

  if (isFinished) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main" style={{ display: "flex", justifyContent: "center", paddingTop: "64px" }}>
          <div className="hh-dash-content" style={{ alignItems: "center", maxWidth: "600px", width: "100%" }}>
            <h1 className="hh-page-title hh-text-green">Workout Complete!</h1>
            <p className="hh-page-subtitle">Your strength session has been saved.</p>
            
            <div className="hh-card" style={{ width: "100%", marginTop: "24px" }}>
              <h2 className="hh-panel-heading">Session Summary</h2>
              <ul className="hh-activity-list">
                {loggedExercises.map((log) => (
                  <li key={log.exercise.id} className="hh-activity-item" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="hh-activity-item__text" style={{ fontWeight: 600 }}>{log.exercise.name}</span>
                      <span className="hh-activity-item__time" style={{ display: "block" }}>{log.sets.length} sets completed</span>
                    </div>
                  </li>
                ))}
                {loggedExercises.length === 0 && (
                  <p className="hh-text-muted">No exercises logged.</p>
                )}
              </ul>
              <button className="btn btn--primary" style={{ width: "100%", marginTop: "24px" }} onClick={() => router.push("/dashboards/user")}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hh-dash-root">
      <main className="hh-dash-main" style={{ display: "flex", justifyContent: "center", paddingTop: "48px", paddingBottom: "48px" }}>
        <div className="hh-dash-content" style={{ maxWidth: "600px", width: "100%" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="hh-page-title">Log Workout</h1>
              <p className="hh-page-subtitle">Strength Training Session</p>
            </div>
            <button className="btn btn--ghost" onClick={handleAttemptLeave} style={{ color: "var(--hh-error)" }}>
              Cancel
            </button>
          </div>

          {!activeExercise ? (
            <div className="hh-card" style={{ marginTop: "24px" }}>
              <div className="hh-card__header">
                <span className="hh-card__label">Today's Plan</span>
              </div>
              {error ? <p className="hh-error-msg">{error}</p> : null}
              
              <ul className="hh-activity-list" style={{ marginBottom: "24px" }}>
                {loadingExercises ? <p className="hh-text-muted">Loading exercises...</p> : null}
                {!loadingExercises && plannedExercises.length === 0 ? <p className="hh-text-muted">No exercises found.</p> : null}
                {plannedExercises.map((ex) => {
                  const isLogged = loggedExercises.some((le) => le.exercise.id === ex.id && le.exercise.name === ex.name);
                  return (
                    <li key={`${ex.id ?? "custom"}-${ex.name}`} className="hh-activity-item" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                      <div>
                        <span className="hh-activity-item__text" style={{ fontWeight: 500 }}>
                          {ex.name}
                        </span>
                        <span className="hh-activity-item__time" style={{ display: "block" }}>{ex.muscleGroup}</span>
                      </div>
                      <button className={`btn ${isLogged ? "btn--ghost" : "btn--primary"}`} onClick={() => handleSelectExercise(ex)}>
                        {isLogged ? "Edit Sets" : "Log Sets"}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--hh-border-50)", paddingTop: "24px" }}>
                <button className="btn btn--ghost" style={{ flex: 1, border: "1px dashed var(--hh-border)" }} onClick={() => setShowCustomModal(true)}>
                  + Add Custom Exercise
                </button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleFinishWorkout} disabled={savingWorkout}>
                  {savingWorkout ? "Saving..." : "Finish Workout"}
                </button>
              </div>
            </div>
          ) : (
            <div className="hh-card" style={{ marginTop: "24px" }}>
              <div className="hh-card__header">
                <span className="hh-card__label">{activeExercise.name}</span>
                <span className="hh-badge">{activeExercise.muscleGroup}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {currentSets.map((set, index) => (
                  <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                    <div className="hh-field" style={{ flex: 1 }}>
                      <label className="hh-field__label">Set {index + 1} Reps</label>
                      <input 
                        type="number" 
                        className="hh-input hh-input--no-icon-left" 
                        placeholder="e.g. 10"
                        value={set.reps}
                        onChange={(e) => {
                          const newSets = [...currentSets];
                          newSets[index].reps = e.target.value ? Number(e.target.value) : "";
                          setCurrentSets(newSets);
                        }}
                      />
                    </div>
                    <div className="hh-field" style={{ flex: 1 }}>
                      <label className="hh-field__label">Weight (lbs)</label>
                      <input 
                        type="number" 
                        className="hh-input hh-input--no-icon-left" 
                        placeholder="e.g. 135"
                        value={set.weight}
                        onChange={(e) => {
                          const newSets = [...currentSets];
                          newSets[index].weight = e.target.value ? Number(e.target.value) : "";
                          setCurrentSets(newSets);
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  className="btn btn--ghost" 
                  style={{ alignSelf: "flex-start", marginTop: "8px", color: "var(--hh-accent-light)" }}
                  onClick={() => setCurrentSets([...currentSets, { reps: "", weight: "" }])}
                >
                  + Add Another Set
                </button>

                <div style={{ display: "flex", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--hh-border-50)" }}>
                  <button className="btn btn--ghost" onClick={() => setActiveExercise(null)}>
                    Back to Plan
                  </button>
                  <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSaveExercise}>
                    Save Exercise
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Alternative Flow 1: Custom Exercise Modal */}
      {showCustomModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }}>
          <div className="hh-card" style={{ width: "100%", maxWidth: "400px" }}>
            <h2 className="hh-panel-heading">Add Custom Exercise</h2>
            <div className="hh-form">
              <div className="hh-field">
                <label className="hh-field__label">Exercise Name</label>
                <input 
                  type="text" 
                  className="hh-input hh-input--no-icon-left" 
                  placeholder="e.g. Incline Dumbbell Press"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Muscle Group</label>
                <select 
                  className="hh-input hh-input--no-icon-left" 
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                  style={{ appearance: "auto" }}
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Arms">Arms</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Core">Core</option>
                  <option value="Full Body">Full Body</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowCustomModal(false)}>Cancel</button>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSaveCustomExercise}>Save & Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Flow 2 */}
      {showLeavePrompt && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "24px" }}>
          <div className="hh-card" style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>
            <h2 className="hh-panel-heading">Save Your Progress and Continue Later?</h2>
            <p className="hh-page-subtitle" style={{ marginBottom: "24px" }}>
              You have unsaved workout data. Do you want to save it so you can finish logging later, or discard it entirely?
            </p>
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button className="btn btn--primary" onClick={() => handleLeaveAction("save")}>
                Save
              </button>
              <button className="btn btn--ghost" style={{ color: "var(--hh-error)", border: "1px solid var(--hh-error)" }} onClick={() => handleLeaveAction("discard")}>
                Discard
              </button>
              <button className="btn btn--ghost" onClick={() => setShowLeavePrompt(false)}>
                Cancel (Keep Logging)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
