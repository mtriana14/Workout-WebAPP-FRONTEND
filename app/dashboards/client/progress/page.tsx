"use client";

import { useEffect, useState } from "react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { progressService, type ProgressEntry, type ProgressSummary } from "@/services/progressService";
import { useAuthStore } from "@/store/authStore";

const LOGO_ICON =
  "";

export default function ProgressPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>({
    total_workouts: 0,
    current_streak: 0,
    weekly_calories: 0,
    goals_met_percentage: 0,
    latest_weight: null,
    weight_change: null,
    entries_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    entry_date: today,
    weight: "",
    workouts_completed: "0",
    calories_burned: "0",
    goal_completed: false,
    notes: "",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        setLoading(true);
        const data = await progressService.getByClient(userId);
        setEntries(data.entries);
        setSummary(data.summary);

        const todaysEntry = data.entries.find((entry) => entry.entry_date === today);
        if (todaysEntry) {
          setForm({
            entry_date: todaysEntry.entry_date,
            weight: todaysEntry.weight?.toString() ?? "",
            workouts_completed: todaysEntry.workouts_completed.toString(),
            calories_burned: todaysEntry.calories_burned.toString(),
            goal_completed: todaysEntry.goal_completed,
            notes: todaysEntry.notes ?? "",
          });
        }
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : "Failed to load your progress.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadProgress();
  }, [today, userId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const selectedEntry = entries.find((entry) => entry.entry_date === form.entry_date);

    if (selectedEntry) {
      setForm((current) => ({
        ...current,
        weight: selectedEntry.weight?.toString() ?? "",
        workouts_completed: selectedEntry.workouts_completed.toString(),
        calories_burned: selectedEntry.calories_burned.toString(),
        goal_completed: selectedEntry.goal_completed,
        notes: selectedEntry.notes ?? "",
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      weight: current.entry_date === today ? current.weight : "",
      workouts_completed: current.entry_date === today ? current.workouts_completed : "0",
      calories_burned: current.entry_date === today ? current.calories_burned : "0",
      goal_completed: false,
      notes: "",
    }));
  }, [entries, form.entry_date, today]);

  const handleSave = async () => {
    if (!userId) {
      setToast({ message: "You need to be signed in to save progress.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      const response = await progressService.saveEntry(userId, {
        entry_date: form.entry_date,
        weight: form.weight.trim() ? Number(form.weight) : null,
        workouts_completed: Number(form.workouts_completed || 0),
        calories_burned: Number(form.calories_burned || 0),
        goal_completed: form.goal_completed,
        notes: form.notes.trim(),
      });

      const refreshed = await progressService.getByClient(userId);
      setEntries(refreshed.entries);
      setSummary(refreshed.summary);
      setToast({ message: response.message, type: "success" });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to save your progress.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const latestEntry = entries[0] ?? null;
  const weightDelta = summary.weight_change;

  return (
    <div className="hh-dash-root">
      {toast ? (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            borderRadius: 8,
            backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1001,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </div>
      ) : null}

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
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

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">MY PROGRESS</h1>
            <p className="hh-page-subtitle">Log daily updates and track your fitness journey</p>
          </div>

          {/* Summary Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Workouts Completed</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-accent)" }}>{loading ? "…" : summary.total_workouts}</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Current Streak</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>{loading ? "…" : `${summary.current_streak} days`}</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Calories This Week</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0" }}>{loading ? "…" : summary.weekly_calories}</p>
            </div>
            <div className="hh-card" style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>Goals Met</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-warning)" }}>{loading ? "…" : `${summary.goals_met_percentage}%`}</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>Log Progress</h3>
                <p style={{ margin: 0, color: "var(--hh-text-muted)", fontSize: 14 }}>
                  Save one entry per day. Submitting the same date updates that day&apos;s log.
                </p>
              </div>

              <div className="hh-field">
                <label className="hh-field__label">Date</label>
                <div className="hh-input-wrap">
                  <input
                    type="date"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={form.entry_date}
                    onChange={(event) => setForm((current) => ({ ...current, entry_date: event.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="hh-field">
                  <label className="hh-field__label">Weight (lb)</label>
                  <div className="hh-input-wrap">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.weight}
                      onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="hh-field">
                  <label className="hh-field__label">Workouts Completed</label>
                  <div className="hh-input-wrap">
                    <input
                      type="number"
                      min="0"
                      className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                      value={form.workouts_completed}
                      onChange={(event) => setForm((current) => ({ ...current, workouts_completed: event.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="hh-field">
                <label className="hh-field__label">Calories Burned</label>
                <div className="hh-input-wrap">
                  <input
                    type="number"
                    min="0"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={form.calories_burned}
                    onChange={(event) => setForm((current) => ({ ...current, calories_burned: event.target.value }))}
                  />
                </div>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--hh-text-primary)" }}>
                <input
                  type="checkbox"
                  checked={form.goal_completed}
                  onChange={(event) => setForm((current) => ({ ...current, goal_completed: event.target.checked }))}
                />
                I met my goal for this day
              </label>

              <div className="hh-field">
                <label className="hh-field__label">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="How did training go today?"
                  style={{
                    width: "100%",
                    minHeight: 110,
                    padding: "12px 14px",
                    background: "var(--hh-bg-card-dark)",
                    border: "1px solid var(--hh-border)",
                    borderRadius: "var(--hh-radius-sm)",
                    color: "var(--hh-text-primary)",
                    fontFamily: "var(--hh-font-body)",
                    resize: "vertical",
                  }}
                />
              </div>

              <button className="btn btn--primary" onClick={handleSave} disabled={saving || loading}>
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="hh-card" style={{ padding: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Weight Snapshot</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>Latest Weight</p>
                    <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>
                      {summary.latest_weight !== null ? `${summary.latest_weight} lb` : "—"}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>Change</p>
                    <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: weightDelta === null ? "var(--hh-text-primary)" : weightDelta <= 0 ? "var(--hh-text-green)" : "var(--hh-warning)" }}>
                      {weightDelta === null ? "—" : `${weightDelta > 0 ? "+" : ""}${weightDelta} lb`}
                    </p>
                  </div>
                </div>
                <p style={{ margin: "16px 0 0", color: "var(--hh-text-muted)", fontSize: 13 }}>
                  {latestEntry ? `Last updated ${new Date(latestEntry.updated_at).toLocaleString()}` : "No progress entries yet."}
                </p>
              </div>

              <div className="hh-card" style={{ padding: 24 }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 600 }}>Recent Entries</h3>
                {loading ? (
                  <p style={{ margin: 0, color: "var(--hh-text-muted)" }}>Loading progress...</p>
                ) : entries.length === 0 ? (
                  <p style={{ margin: 0, color: "var(--hh-text-muted)" }}>No entries yet. Save your first update to start tracking progress.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {entries.slice(0, 6).map((entry) => (
                      <div key={entry.entry_id} style={{ paddingBottom: 12, borderBottom: "1px solid var(--hh-border)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                              {new Date(`${entry.entry_date}T00:00:00`).toLocaleDateString()}
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>
                              {entry.workouts_completed} workout{entry.workouts_completed === 1 ? "" : "s"} · {entry.calories_burned} cal
                            </p>
                          </div>
                          <span
                            style={{
                              alignSelf: "flex-start",
                              padding: "4px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: entry.goal_completed ? "rgba(34, 197, 94, 0.12)" : "rgba(156, 163, 175, 0.12)",
                              color: entry.goal_completed ? "var(--hh-text-green)" : "var(--hh-text-muted)",
                            }}
                          >
                            {entry.goal_completed ? "Goal Met" : "In Progress"}
                          </span>
                        </div>
                        {entry.weight !== null ? (
                          <p style={{ margin: "8px 0 0", fontSize: 13 }}>Weight: {entry.weight} lb</p>
                        ) : null}
                        {entry.notes ? (
                          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{entry.notes}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
