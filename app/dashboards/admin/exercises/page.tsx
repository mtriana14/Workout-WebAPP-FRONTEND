"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { exerciseService, Exercise, CreateExerciseData } from "@/services/exerciseService";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

const MUSCLE_GROUPS = [
  "chest", "back", "shoulders", "arms", "legs", "core", "glutes", "full_body"
];

const EQUIPMENT_TYPES = [
  "barbell", "dumbbell", "machine", "bodyweight", "cables", "bands", "other"
];

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: "rgba(34, 197, 94, 0.1)",  color: "#22c55e" },
  intermediate: { bg: "rgba(234, 179, 8, 0.1)",  color: "#eab308" },
  advanced:     { bg: "rgba(239, 68, 68, 0.1)",  color: "#ef4444" },
};

const EMPTY_FORM: CreateExerciseData = {
  name: "",
  description: "",
  muscle_group: "",
  equipment_type: "bodyweight",
  difficulty: "beginner",
  
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateExerciseData>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAll();
      setExercises(data.exercises);
    } catch {
      setError("Failed to load exercises.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // Open modal for create
  const handleCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (exercise: Exercise) => {
    setEditingId(exercise.e_id);
    setFormData({
      name: exercise.name,
      description: exercise.description || "",
      muscle_group: exercise.muscle_group || "",
      equipment_type: exercise.equipment_type,
      difficulty: exercise.difficulty,
    });
    setFormError("");
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    if (!formData.name || !formData.muscle_group) {
      setFormError("Name and muscle group are required.");
      return;
    }

    setFormLoading(true);
    try {
      if (editingId) {
        await exerciseService.update(editingId, formData);
        showToast("Exercise updated successfully", "success");
      } else {
        await exerciseService.create(formData);
        showToast("Exercise created successfully", "success");
      }
      setShowModal(false);
      loadExercises();
    } catch {
      setFormError("Failed to save exercise.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete exercise
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await exerciseService.delete(deleteId);
      showToast("Exercise deleted successfully", "success");
      setDeleteId(null);
      loadExercises();
    } catch {
      showToast("Failed to delete exercise", "error");
    }
  };

  // Filter exercises
  const filtered = exercises.filter((e) => {
    const matchesSearch = `${e.name} ${e.description || ""} ${e.equipment_type}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesMuscle = filterMuscle === "all" || e.muscle_group === filterMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="hh-dash-root">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            borderRadius: 8,
            backgroundColor: toast.type === "success" ? "#22c55e" : "#ef4444",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="hh-card"
            style={{ width: 400, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 18 }}>Delete Exercise?</h3>
            <p style={{ color: "var(--hh-text-muted)", margin: "0 0 20px", fontSize: 14 }}>
              This action cannot be undone. Are you sure you want to delete this exercise?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 6,
                  background: "#ef4444",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="hh-card"
            style={{ width: 500, padding: 24, maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>
              {editingId ? "Edit Exercise" : "Add New Exercise"}
            </h3>

            {formError && (
              <p style={{ color: "#ef4444", fontSize: 14, margin: "0 0 16px" }}>{formError}</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Name *
                </label>
                <input
                  type="text"
                  className="hh-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bench Press"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  className="hh-input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the exercise..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Muscle Group *
                  </label>
                  <select
                    className="hh-input"
                    value={formData.muscle_group}
                    onChange={(e) => setFormData({ ...formData, muscle_group: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {MUSCLE_GROUPS.map((m) => (
                      <option key={m} value={m} style={{ textTransform: "capitalize" }}>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                    Difficulty
                  </label>
                  <select
                    className="hh-input"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as "beginner" | "intermediate" | "advanced",
                      })
                    }
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  Equipment
                </label>
                <input
                  type="text"
                  className="hh-input"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  placeholder="e.g., Barbell, Dumbbells, None"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid var(--hh-border)",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: 6,
                  background: "var(--hh-accent)",
                  color: "white",
                  cursor: formLoading ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: formLoading ? 0.6 : 1,
                }}
              >
                {formLoading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="hh-page-title">EXERCISE DATABASE</h1>
              <p className="hh-page-subtitle">Manage the master list of exercises</p>
            </div>
            <button
              onClick={handleCreate}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: 8,
                background: "var(--hh-accent)",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              + Add Exercise
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{exercises.length}</p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>
                Total Exercises
              </p>
            </div>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
                {new Set(exercises.map((e) => e.muscle_group)).size}
              </p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>
                Muscle Groups
              </p>
            </div>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
                {new Set(exercises.map((e) => e.equipment).filter(Boolean)).size}
              </p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>
                Equipment Types
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="hh-card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hh-input"
              style={{ flex: 1, maxWidth: 400 }}
            />
            <select
              value={filterMuscle}
              onChange={(e) => setFilterMuscle(e.target.value)}
              className="hh-input"
              style={{ width: 180 }}
            >
              <option value="all">All Muscle Groups</option>
              {MUSCLE_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading exercises...</p>
            )}
            {error && <p style={{ padding: 24, color: "#ef4444" }}>{error}</p>}
            {!loading && !error && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hh-border)" }}>
                    {["Name", "Muscle Group", "Equipment", "Difficulty", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--hh-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}
                      >
                        No exercises found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((e) => {
                    const diff = DIFFICULTY_COLORS[e.difficulty] || DIFFICULTY_COLORS.beginner;
                    return (
                      <tr key={e.e_id} style={{ borderBottom: "1px solid var(--hh-border)" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{e.name}</p>
                            {e.description && (
                              <p
                                style={{
                                  margin: "4px 0 0",
                                  fontSize: 12,
                                  color: "var(--hh-text-muted)",
                                  maxWidth: 300,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {e.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, textTransform: "capitalize" }}>
                          {e.muscle_group}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)", textTransform: "capitalize" }}>
                          {e.equipment_type || "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: diff.bg,
                              color: diff.color,
                              textTransform: "capitalize",
                            }}
                          >
                            {e.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => handleEdit(e)}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                border: "1px solid var(--hh-border)",
                                borderRadius: 6,
                                background: "transparent",
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteId(e.e_id)}
                              style={{
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                border: "none",
                                borderRadius: 6,
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
