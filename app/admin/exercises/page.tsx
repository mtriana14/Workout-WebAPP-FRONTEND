"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Plus, Search, Trash2 } from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";
import {
  createAdminExercise,
  deleteAdminExercise,
  fetchAdminExercises,
  getStoredAuthToken,
  updateAdminExercise,
  type AdminExerciseRecord,
} from "@/app/lib/api";

const MUSCLE_GROUPS = ["chest", "back", "shoulders", "arms", "legs", "glutes", "core", "full_body"];
const EQUIPMENT_TYPES = ["barbell", "dumbbell", "machine", "bodyweight", "cables", "bands", "other"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const EMPTY_DRAFT = {
  id: 0,
  name: "",
  description: "",
  muscle_group: "legs",
  equipment_type: "bodyweight",
  difficulty: "beginner",
  instructions: "",
  video_url: "",
};

type ExerciseDraft = typeof EMPTY_DRAFT;

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<AdminExerciseRecord[]>([]);
  const [draft, setDraft] = useState<ExerciseDraft>(EMPTY_DRAFT);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isEditing = draft.id > 0;

  async function loadExercises() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before loading exercises.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const response = await fetchAdminExercises(token);
      setExercises(response.exercises);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load exercises.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return exercises;
    }

    return exercises.filter((exercise) =>
      [
        exercise.name,
        exercise.muscle_group ?? "",
        exercise.equipment_type ?? "",
        exercise.difficulty ?? "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [exercises, search]);

  function updateDraft<Key extends keyof ExerciseDraft>(key: Key, value: ExerciseDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function editExercise(exercise: AdminExerciseRecord) {
    setDraft({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description ?? "",
      muscle_group: exercise.muscle_group ?? "legs",
      equipment_type: exercise.equipment_type ?? "bodyweight",
      difficulty: exercise.difficulty ?? "beginner",
      instructions: exercise.instructions ?? "",
      video_url: exercise.video_url ?? "",
    });
    setStatus("");
  }

  async function handleSave() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before saving exercises.");
      return;
    }

    if (!draft.name.trim()) {
      setError("Exercise name is required.");
      return;
    }

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      muscle_group: draft.muscle_group,
      equipment_type: draft.equipment_type,
      difficulty: draft.difficulty,
      instructions: draft.instructions.trim(),
      video_url: draft.video_url.trim(),
    };

    try {
      setError("");
      setStatus("");
      const response = isEditing
        ? await updateAdminExercise(token, draft.id, payload)
        : await createAdminExercise(token, payload);
      setStatus(response.message);
      setDraft(EMPTY_DRAFT);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save exercise.");
    }
  }

  async function handleDelete(exercise: AdminExerciseRecord) {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before deleting exercises.");
      return;
    }

    if (!window.confirm(`Delete ${exercise.name} from the exercise database?`)) {
      return;
    }

    try {
      setError("");
      setStatus("");
      const response = await deleteAdminExercise(token, exercise.id);
      setStatus(response.message);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete exercise.");
    }
  }

  return (
    <AdminPortalShell
      activePage="exercises"
      title="EXERCISE DB"
      subtitle="Maintain the master exercise library used by plans and activity logging."
    >
      <div className="hh-stats-grid">
        {[
          { label: "Total Exercises", value: exercises.length },
          { label: "Muscle Groups", value: new Set(exercises.map((exercise) => exercise.muscle_group)).size },
          { label: "Equipment Types", value: new Set(exercises.map((exercise) => exercise.equipment_type)).size },
          { label: "Advanced Moves", value: exercises.filter((exercise) => exercise.difficulty === "advanced").length },
        ].map((card) => (
          <div key={card.label} className="hh-card">
            <div className="hh-card__header">
              <span className="hh-card__label">{card.label}</span>
              <div className="hh-card__icon">
                <Activity size={16} color="var(--hh-text-muted)" />
              </div>
            </div>
            <p className="hh-card__value">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="hh-error-msg">{error}</p> : null}
      {status ? <p className="hh-portal-status">{status}</p> : null}

      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 1 }}>
          <h2 className="hh-panel-heading">{isEditing ? "Edit Exercise" : "Add Exercise"}</h2>
          <div className="hh-portal-form-grid">
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Name</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
              />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Muscle group</span>
              <select
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.muscle_group}
                onChange={(event) => updateDraft("muscle_group", event.target.value)}
              >
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Equipment</span>
              <select
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.equipment_type}
                onChange={(event) => updateDraft("equipment_type", event.target.value)}
              >
                {EQUIPMENT_TYPES.map((equipment) => (
                  <option key={equipment} value={equipment}>
                    {equipment}
                  </option>
                ))}
              </select>
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Difficulty</span>
              <select
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.difficulty}
                onChange={(event) => updateDraft("difficulty", event.target.value)}
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Video URL</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.video_url}
                onChange={(event) => updateDraft("video_url", event.target.value)}
              />
            </label>
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Description</span>
              <textarea
                className="hh-portal-textarea"
                value={draft.description}
                onChange={(event) => updateDraft("description", event.target.value)}
              />
            </label>
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Instructions</span>
              <textarea
                className="hh-portal-textarea"
                value={draft.instructions}
                onChange={(event) => updateDraft("instructions", event.target.value)}
              />
            </label>
          </div>
          <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
            {isEditing ? (
              <button
                type="button"
                className="hh-portal-button hh-portal-button--secondary"
                onClick={() => setDraft(EMPTY_DRAFT)}
              >
                Cancel
              </button>
            ) : null}
            <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={() => void handleSave()}>
              <Plus size={14} /> {isEditing ? "Save Exercise" : "Add Exercise"}
            </button>
          </div>
        </section>

        <section className="hh-card" style={{ flex: 1.4 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>Exercise Library</h2>
              <p className="hh-portal-card-copy">Search and edit existing records.</p>
            </div>
          </div>
          <div className="hh-input-wrap" style={{ marginBottom: 16 }}>
            <Search size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
            <input
              className="hh-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exercises"
            />
          </div>
          {isLoading ? (
            <p className="hh-portal-card-copy">Loading exercises from the database...</p>
          ) : filteredExercises.length === 0 ? (
            <p className="hh-portal-card-copy">No exercises match the current search.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} style={{ padding: "14px 0", borderTop: "1px solid var(--hh-border)" }}>
                  <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p className="hh-portal-summary-value">{exercise.name}</p>
                      <p className="hh-portal-card-copy">
                        {exercise.muscle_group} · {exercise.equipment_type} · {exercise.difficulty}
                      </p>
                      <p className="hh-portal-card-copy">{exercise.description || "No description."}</p>
                    </div>
                    <div className="hh-portal-header__actions">
                      <button
                        type="button"
                        className="hh-portal-button hh-portal-button--secondary"
                        onClick={() => editExercise(exercise)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="hh-portal-button hh-portal-button--ghost"
                        onClick={() => void handleDelete(exercise)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPortalShell>
  );
}
