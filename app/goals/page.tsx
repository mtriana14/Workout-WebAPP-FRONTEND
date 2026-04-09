"use client";

import { useEffect, useState } from "react";
import { Target, Plus, Trash2, Edit2, CheckCircle, X } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import {
  getStoredAuthToken,
  getFitnessGoals,
  createFitnessGoal,
  updateFitnessGoal,
  deleteFitnessGoal,
  type FitnessGoal
} from "@/app/lib/api";

export default function GoalsPage() {
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [goalType, setGoalType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<'active' | 'completed' | 'deleted'>("active");

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    const token = getStoredAuthToken();
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError("");
      const response = await getFitnessGoals(token);
      setGoals(response.Goals || []);
    } catch (err) {
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setGoalType("");
    setTargetValue("");
    setTargetUnit("");
    setDeadline("");
    setStatus("active");
    setIsFormOpen(true);
  }

  function openEditForm(goal: FitnessGoal) {
    setEditingId(goal.goal_id);
    setGoalType(goal.goal_type);
    setTargetValue(goal.target_value ? goal.target_value.toString() : "");
    setTargetUnit(goal.target_unit || "");
    // Extract YYYY-MM-DD from ISO string for the date input
    setDeadline(goal.deadline ? goal.deadline.split("T")[0] : "");
    setStatus(goal.status);
    setIsFormOpen(true);
  }

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredAuthToken();
    if (!token) return;

    const payload = {
      goal_type: goalType,
      target_value: targetValue ? parseFloat(targetValue) : null,
      target_unit: targetUnit || null,
      deadline: deadline || null,
      status: status
    };

    try {
      if (editingId) {
        await updateFitnessGoal(token, editingId, payload);
      } else {
        await createFitnessGoal(token, payload);
      }
      setIsFormOpen(false);
      fetchGoals(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal.");
    }
  }

  async function handleDelete(goalId: number) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    const token = getStoredAuthToken();
    if (!token) return;

    try {
      await deleteFitnessGoal(token, goalId);
      fetchGoals();
    } catch (err) {
      setError("Failed to delete goal.");
    }
  }

  return (
    <MemberPortalShell
      activePage="goals"
      title="FITNESS GOALS"
      subtitle="Set, track, and update your specific fitness targets."
      headerActions={
        !isFormOpen && (
          <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={openCreateForm}>
            <Plus size={16} style={{ marginRight: 8 }} />
            New Goal
          </button>
        )
      }
    >
      {error && <p className="hh-error-msg">{error}</p>}

      {isFormOpen ? (
        <div className="hh-card" style={{ marginBottom: 24 }}>
          <div className="hh-portal-card-heading">
            <h2 className="hh-panel-heading">{editingId ? "Edit Goal" : "Create New Goal"}</h2>
            <button className="hh-portal-inline-link" onClick={() => setIsFormOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <form className="hh-form" onSubmit={handleSaveGoal}>
            <div className="hh-field">
              <label className="hh-field__label">Goal Type (e.g., Weight Loss, Run 5k)</label>
              <input required className="hh-input" value={goalType} onChange={(e) => setGoalType(e.target.value)} />
            </div>

            <div className="hh-field-row">
              <div className="hh-field" style={{ flex: 1 }}>
                <label className="hh-field__label">Target Value</label>
                <input type="number" step="0.1" className="hh-input" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} />
              </div>
              <div className="hh-field" style={{ flex: 1 }}>
                <label className="hh-field__label">Unit (e.g., lbs, miles)</label>
                <input className="hh-input" value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} />
              </div>
            </div>

            <div className="hh-field-row">
              <div className="hh-field" style={{ flex: 1 }}>
                <label className="hh-field__label">Target Deadline</label>
                <input type="date" className="hh-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="hh-field" style={{ flex: 1 }}>
                <label className="hh-field__label">Status</label>
                <select className="hh-input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn--submit" style={{ marginTop: 16 }}>
              {editingId ? "Save Changes" : "Create Goal"}
            </button>
          </form>
        </div>
      ) : null}

      <div className="hh-stats-grid">
        {isLoading ? <p>Loading goals...</p> : goals.length === 0 ? <p className="hh-text-muted">You have no active goals. Create one above!</p> : null}
        
        {goals.map((goal) => (
          <div key={goal.goal_id} className="hh-card" style={{ position: "relative" }}>
            <div className="hh-card__header">
              <span className="hh-card__label" style={{ color: goal.status === 'completed' ? 'var(--hh-green)' : '' }}>
                {goal.status === 'completed' ? 'COMPLETED' : 'ACTIVE'}
              </span>
              <div className="hh-card__icon">
                {goal.status === 'completed' ? <CheckCircle size={16} color="var(--hh-green)"/> : <Target size={16} color="var(--hh-text-muted)" />}
              </div>
            </div>
            
            <h3 style={{ fontSize: 18, fontWeight: 600, marginTop: 12, marginBottom: 4 }}>{goal.goal_type}</h3>
            
            {goal.target_value && (
              <p className="hh-card__value" style={{ fontSize: 24 }}>
                {goal.target_value} <span style={{ fontSize: 14, color: "var(--hh-text-muted)" }}>{goal.target_unit}</span>
              </p>
            )}
            
            {goal.deadline && (
              <p className="hh-text-muted" style={{ fontSize: 13, marginTop: 8 }}>
                Deadline: {new Date(goal.deadline).toLocaleDateString()}
              </p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid #2c2c30" }}>
              <button onClick={() => openEditForm(goal)} className="hh-portal-inline-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Edit2 size={14} /> Edit
              </button>
              <button onClick={() => handleDelete(goal.goal_id)} className="hh-portal-inline-link" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--hh-red)' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </MemberPortalShell>
  );
}