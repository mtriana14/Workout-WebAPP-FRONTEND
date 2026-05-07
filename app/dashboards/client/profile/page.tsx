"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dumbbell, User, Trash2, Plus, Pencil } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { fileToDataUrl } from "@/lib/profilePhotoStorage";
import { resolveMediaUrl } from "@/lib/media";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { 
  getStoredAuthToken,
  fetchFitnessGoals,
  createFitnessGoal,
  updateFitnessGoal,
  deleteFitnessGoal,
  type FitnessGoal,
} from "@/app/lib/api";

const EMPTY_FORM = {
  first_name:    "",
  last_name:     "",
  email:         "",
  phone:         "",
  profile_photo: "",
  weight:        "",
  height:        "",
  date_of_birth: "",
  fitness_goal:  "",
};

const EMPTY_GOAL_FORM = {
  goal_type:    "",
  target_value: "",
  target_unit:  "",
  deadline:     "",
  status:       "active",
};

export default function ClientProfile() {
  const { user }  = useAuthStore();
  const userId    = user?.id ?? user?.user_id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [goalId, setGoalId]   = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState<{ type: "success" | "error"; message: string } | null>(null);

  // fitness goals state
  const [fitnessGoals, setFitnessGoals]     = useState<FitnessGoal[]>([]);
  const [goalsLoading, setGoalsLoading]     = useState(true);
  const [showGoalForm, setShowGoalForm]     = useState(false);
  const [goalForm, setGoalForm]             = useState(EMPTY_GOAL_FORM);
  const [editingGoalId, setEditingGoalId]   = useState<number | null>(null);
  const [goalStatus, setGoalStatus]         = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [goalSaving, setGoalSaving]         = useState(false);

  // ── fetch fitness goals ──────────────────────────────────────────────────────
  const loadFitnessGoals = async () => {
    const token = getStoredAuthToken();
    if (!token) return;
    try {
      setGoalsLoading(true);
      const data = await fetchFitnessGoals(token);
      setFitnessGoals(data.Goals ?? []);
    } catch {
      setFitnessGoals([]);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const [{ user: u }, goal] = await Promise.all([
          profileService.getUser(Number(userId)),
          profileService.getFitnessGoal(),
        ]);
        setForm({
          first_name:    u.first_name ?? "",
          last_name:     u.last_name ?? "",
          email:         u.email ?? "",
          phone:         u.phone ?? "",
          profile_photo: u.profile_photo ?? "",
          weight:        u.weight != null ? String(u.weight) : "",
          height:        u.height != null ? String(u.height) : "",
          date_of_birth: u.date_of_birth ?? "",
          fitness_goal:  goal?.goal_type ?? "",
        });
        setGoalId(goal?.goal_id ?? null);
      } catch {
        setForm({
          ...EMPTY_FORM,
          first_name: user?.first_name ?? user?.firstName ?? "",
          last_name:  user?.last_name ?? user?.lastName ?? "",
          email:      user?.email ?? "",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
    void loadFitnessGoals();
  }, [user, userId]);

  // ── create or update goal ────────────────────────────────────────────────────
  const handleGoalSubmit = async () => {
    const token = getStoredAuthToken();
    if (!token) return;

    if (!goalForm.goal_type.trim()) {
      setGoalStatus({ type: "error", message: "Goal type is required." });
      return;
    }

    try {
      setGoalSaving(true);
      const payload = {
        goal_type:    goalForm.goal_type,
        target_value: goalForm.target_value ? parseFloat(goalForm.target_value) : null,
        target_unit:  goalForm.target_unit || null,
        deadline:     goalForm.deadline || null,
        status:       goalForm.status,
      };

      if (editingGoalId) {
        await updateFitnessGoal(token, editingGoalId, payload);
        setGoalStatus({ type: "success", message: "Goal updated." });
      } else {
        await createFitnessGoal(token, payload);
        setGoalStatus({ type: "success", message: "Goal created." });
      }

      setGoalForm(EMPTY_GOAL_FORM);
      setShowGoalForm(false);
      setEditingGoalId(null);
      void loadFitnessGoals();
    } catch (err) {
      setGoalStatus({ type: "error", message: err instanceof Error ? err.message : "Error saving goal." });
    } finally {
      setGoalSaving(false);
    }
  };

  // ── delete goal ──────────────────────────────────────────────────────────────
  const handleGoalDelete = async (goal_id: number) => {
    const token = getStoredAuthToken();
    if (!token || !confirm("Delete this goal?")) return;
    try {
      await deleteFitnessGoal(token, goal_id);
      setGoalStatus({ type: "success", message: "Goal deleted." });
      void loadFitnessGoals();
    } catch (err) {
      setGoalStatus({ type: "error", message: err instanceof Error ? err.message : "Error deleting goal." });
    }
  };

  // ── populate form for editing ────────────────────────────────────────────────
  const handleGoalEdit = (goal: FitnessGoal) => {
    setGoalForm({
      goal_type:    goal.goal_type,
      target_value: goal.target_value != null ? String(goal.target_value) : "",
      target_unit:  goal.target_unit ?? "",
      deadline:     goal.deadline ?? "",
      status:       goal.status,
    });
    setEditingGoalId(goal.goal_id);
    setShowGoalForm(true);
  };

  // ── save profile ─────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before saving your profile." });
      return;
    }
    try {
      setSaving(true);
      const weightNum = form.weight ? parseFloat(form.weight) : undefined;
      const heightNum = form.height ? parseFloat(form.height) : undefined;
      await Promise.all([
        profileService.updateUser(Number(userId), {
          first_name: form.first_name,
          last_name:  form.last_name,
          email:      form.email,
          phone:      form.phone,
          ...(weightNum != null && { weight: weightNum }),
          ...(heightNum != null && { height: heightNum }),
          ...(form.date_of_birth && { date_of_birth: form.date_of_birth }),
        }),
        profileService.upsertFitnessGoal(form.fitness_goal, goalId),
      ]);
      setStatus({ type: "success", message: "Profile saved." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setStatus({ type: "error", message: "Upload a JPG or PNG image." });
      return;
    }
    try {
      setSaving(true);
      const response = await profileService.uploadPhoto(file);
      const photo = response.profile_photo ?? (await fileToDataUrl(file));
      setForm((current) => ({ ...current, profile_photo: photo }));
      setStatus({ type: "success", message: response.Success ?? "Profile photo uploaded." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to upload photo." });
    } finally {
      setSaving(false);
      if (event.target) event.target.value = "";
    }
  };

  const statusColor = (s: string) => {
    if (s === "active")    return "#22c55e";
    if (s === "completed") return "#3b82f6";
    if (s === "deleted")   return "#ef4444";
    return "#6b7280";
  };

  return (
    <div className="hh-dash-root">
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content" style={{ maxWidth: 680 }}>
          <div>
            <h1 className="hh-page-title">PROFILE</h1>
            <p className="hh-page-subtitle">Your personal information</p>
          </div>

          {/* ── profile card ── */}
          <div className="hh-card">
            {status && (
              <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p>
            )}

            {/* Photo */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--hh-bg-card-dark)", border: "2px solid var(--hh-border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.profile_photo ? (
                  <img src={resolveMediaUrl(form.profile_photo) ?? form.profile_photo} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={32} color="var(--hh-text-muted)" />
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" onChange={uploadPhoto} style={{ display: "none" }} />
                <button className="btn btn--ghost" type="button" onClick={() => fileInputRef.current?.click()} disabled={saving || loading} style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}>
                  Upload Photo
                </button>
                <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginTop: 4 }}>JPG, PNG up to 5MB</p>
              </div>
            </div>

            {/* Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">First Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.first_name} onChange={(e) => setForm((c) => ({ ...c, first_name: e.target.value }))} />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Last Name</label>
                <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.last_name} onChange={(e) => setForm((c) => ({ ...c, last_name: e.target.value }))} />
              </div>
            </div>

            {/* Email */}
            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Email</label>
              <input type="email" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} />
            </div>

            {/* Phone */}
            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Phone</label>
              <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))} placeholder="Optional" />
            </div>

            {/* Date of Birth */}
            <div className="hh-field" style={{ marginBottom: 16 }}>
              <label className="hh-field__label">Date of Birth</label>
              <input type="date" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" max="9999-12-31" value={form.date_of_birth} onChange={(e) => { const v = e.target.value; if (!v || v.split("-")[0].length <= 4) setForm((c) => ({ ...c, date_of_birth: v })); }} />
            </div>

            {/* Weight & Height */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">Weight (lbs)</label>
                <input type="number" min="0" max="999" step="0.1" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.weight} onChange={(e) => { const v = e.target.value; if (v === "" || /^\d{0,3}(\.\d*)?$/.test(v)) setForm((c) => ({ ...c, weight: v })); }} placeholder="e.g. 165" />
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Height (in)</label>
                <input type="number" min="0" max="999" step="0.1" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={form.height} onChange={(e) => { const v = e.target.value; if (v === "" || /^\d{0,3}(\.\d*)?$/.test(v)) setForm((c) => ({ ...c, height: v })); }} placeholder="e.g. 68" />
              </div>
            </div>

            {/* Fitness Goal (single) */}
            <div className="hh-field" style={{ marginBottom: 24 }}>
              <label className="hh-field__label">Fitness Goal</label>
              <textarea className="hh-input hh-input--no-icon-left hh-input--no-icon-right" rows={3} value={form.fitness_goal} onChange={(e) => setForm((c) => ({ ...c, fitness_goal: e.target.value }))} placeholder="Describe your fitness goal..." style={{ resize: "vertical", minHeight: 80 }} />
            </div>

            <button className="btn btn--primary" onClick={saveProfile} disabled={saving || loading}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {/* ── fitness goals card ── */}
          <div className="hh-card" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>FITNESS GOALS</h2>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>Track your progress targets</p>
              </div>
              <button
                className="btn btn--primary"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                onClick={() => { setShowGoalForm(true); setEditingGoalId(null); setGoalForm(EMPTY_GOAL_FORM); }}
              >
                <Plus size={14} /> Add Goal
              </button>
            </div>

            {goalStatus && (
              <p className={goalStatus.type === "error" ? "hh-error-msg" : "hh-text-green"} style={{ marginBottom: 12 }}>
                {goalStatus.message}
              </p>
            )}

            {/* add/edit form */}
            {showGoalForm && (
              <div style={{ background: "var(--hh-bg-card-dark)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  {editingGoalId ? "Edit Goal" : "New Goal"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div className="hh-field">
                    <label className="hh-field__label">Goal Type *</label>
                    <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="e.g. Weight loss" value={goalForm.goal_type} onChange={(e) => setGoalForm((c) => ({ ...c, goal_type: e.target.value }))} />
                  </div>
                  <div className="hh-field">
                    <label className="hh-field__label">Status</label>
                    <select className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={goalForm.status} onChange={(e) => setGoalForm((c) => ({ ...c, status: e.target.value }))}>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <div className="hh-field">
                    <label className="hh-field__label">Target Value</label>
                    <input type="number" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="e.g. 185" value={goalForm.target_value} onChange={(e) => setGoalForm((c) => ({ ...c, target_value: e.target.value }))} />
                  </div>
                  <div className="hh-field">
                    <label className="hh-field__label">Unit</label>
                    <input className="hh-input hh-input--no-icon-left hh-input--no-icon-right" placeholder="e.g. lbs" value={goalForm.target_unit} onChange={(e) => setGoalForm((c) => ({ ...c, target_unit: e.target.value }))} />
                  </div>
                  <div className="hh-field">
                    <label className="hh-field__label">Deadline</label>
                    <input type="date" className="hh-input hh-input--no-icon-left hh-input--no-icon-right" value={goalForm.deadline} onChange={(e) => setGoalForm((c) => ({ ...c, deadline: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn--primary" onClick={handleGoalSubmit} disabled={goalSaving}>
                    {goalSaving ? "Saving..." : editingGoalId ? "Update Goal" : "Create Goal"}
                  </button>
                  <button className="btn btn--ghost" onClick={() => { setShowGoalForm(false); setEditingGoalId(null); setGoalForm(EMPTY_GOAL_FORM); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* goals list */}
            {goalsLoading ? (
              <p style={{ color: "var(--hh-text-muted)", fontSize: 14 }}>Loading goals...</p>
            ) : fitnessGoals.length === 0 ? (
              <p style={{ color: "var(--hh-text-muted)", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                No fitness goals yet. Add one above!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {fitnessGoals.map((goal) => (
                  <div key={goal.goal_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 16px", background: "var(--hh-bg-card-dark)", borderRadius: 8, border: "1px solid var(--hh-border)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{goal.goal_type}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `${statusColor(goal.status)}20`, color: statusColor(goal.status), fontWeight: 500 }}>
                          {goal.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--hh-text-muted)" }}>
                        {goal.target_value && (
                          <span>Target: {goal.target_value} {goal.target_unit ?? ""}</span>
                        )}
                        {goal.deadline && (
                          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button className="btn btn--ghost" style={{ padding: "4px 8px" }} onClick={() => handleGoalEdit(goal)}>
                        <Pencil size={13} />
                      </button>
                      <button className="btn btn--ghost" style={{ padding: "4px 8px", color: "#ef4444" }} onClick={() => handleGoalDelete(goal.goal_id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}