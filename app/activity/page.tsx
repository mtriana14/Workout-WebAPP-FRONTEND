"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Activity as HeartPulse, Footprints, History, Trash2 } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { 
  getStoredAuthToken, 
  logStrengthRequest, 
  logCardioRequest, 
  logDailyMetricsRequest, 
  fetchActivityLogs, 
  deleteActivityLog 
} from "@/app/lib/api";

type TabType = "strength" | "cardio" | "metrics" | "history";

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<TabType>("strength");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Default date to today
  const today = new Date().toISOString().split("T")[0];
  const [logDate, setLogDate] = useState(today);

  // Form States
  const [strengthForm, setStrengthForm] = useState({ exercise_id: "1", sets: "", reps: "", weight: "" });
  const [cardioForm, setCardioForm] = useState({ type: "running", duration: "", distance: "", heartRate: "", calories: "" });
  const [metricsForm, setMetricsForm] = useState({ steps: "", calories: "" });

  // Load history when history tab is clicked
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab]);

  async function loadHistory() {
    const token = getStoredAuthToken();
    if (!token) return;
    try {
      const data = await fetchActivityLogs(token) as any; 
      
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    }
  }

  function displayStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  }

  // UC 4.1 - Log Strength
  async function handleStrengthSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredAuthToken();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await logStrengthRequest(token, {
        log_date: logDate,
        exercise_id: parseInt(strengthForm.exercise_id),
        sets_completed: parseInt(strengthForm.sets) || 0,
        reps_completed: parseInt(strengthForm.reps) || 0,
        weight_used: parseFloat(strengthForm.weight) || 0
      });
      displayStatus("success", "Strength session logged successfully!");
      setStrengthForm({ ...strengthForm, sets: "", reps: "", weight: "" });
    } catch (err) {
      displayStatus("error", err instanceof Error ? err.message : "Failed to log workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  // UC 4.2 - Log Cardio
  async function handleCardioSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredAuthToken();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await logCardioRequest(token, {
        log_date: logDate,
        cardio_type: cardioForm.type,
        duration_minutes: parseInt(cardioForm.duration) || 0,
        distance: parseFloat(cardioForm.distance) || 0,
        // Packing extra requested data into notes since backend lacks these columns
        notes: `HR: ${cardioForm.heartRate} bpm | Burned: ${cardioForm.calories} kcal`
      });
      displayStatus("success", "Cardio session logged successfully!");
      setCardioForm({ ...cardioForm, duration: "", distance: "", heartRate: "", calories: "" });
    } catch (err) {
      displayStatus("error", err instanceof Error ? err.message : "Failed to log cardio");
    } finally {
      setIsSubmitting(false);
    }
  }

  // UC 4.3 - Log Metrics
  async function handleMetricsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredAuthToken();
    if (!token) return;

    if (!metricsForm.steps && !metricsForm.calories) {
      displayStatus("error", "Please enter either steps or calories.");
      return;
    }

    setIsSubmitting(true);
    try {
      await logDailyMetricsRequest(token, {
        log_date: logDate,
        step_count: metricsForm.steps ? parseInt(metricsForm.steps) : null,
        calorie_intake: metricsForm.calories ? parseInt(metricsForm.calories) : null
      });
      displayStatus("success", "Daily metrics saved!");
      setMetricsForm({ steps: "", calories: "" });
    } catch (err) {
      displayStatus("error", err instanceof Error ? err.message : "Failed to log metrics");
    } finally {
      setIsSubmitting(false);
    }
  }

  // UC 4.4 - Delete Log
  async function handleDelete(logId: number) {
    const confirmed = window.confirm("Are you sure? This cannot be undone.");
    if (!confirmed) return;

    const token = getStoredAuthToken();
    if (!token) return;

    try {
      await deleteActivityLog(token, logId);
      // Remove from UI
      setLogs((prev) => prev.filter(l => l.log_id !== logId));
      alert("Log Entry Deleted");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete log");
    }
  }

  return (
    <MemberPortalShell activePage="activity" title="ACTIVITY HUB" subtitle="Track your workouts, cardio, and daily metrics.">
      
      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <button className={`btn ${activeTab === "strength" ? "btn--primary" : "btn--secondary"}`} onClick={() => setActiveTab("strength")}>
          <Dumbbell size={16} /> Strength
        </button>
        <button className={`btn ${activeTab === "cardio" ? "btn--primary" : "btn--secondary"}`} onClick={() => setActiveTab("cardio")}>
          <HeartPulse size={16} /> Cardio
        </button>
        <button className={`btn ${activeTab === "metrics" ? "btn--primary" : "btn--secondary"}`} onClick={() => setActiveTab("metrics")}>
          <Footprints size={16} /> Daily Metrics
        </button>
        <button className={`btn ${activeTab === "history" ? "btn--primary" : "btn--ghost"}`} onClick={() => setActiveTab("history")} style={{ marginLeft: "auto" }}>
          <History size={16} /> History
        </button>
      </div>

      <div className="hh-card" style={{ maxWidth: activeTab === "history" ? "100%" : 600 }}>
        
        {status.message && (
          <div style={{ padding: 12, backgroundColor: status.type === "error" ? "#dc3545" : "var(--hh-green)", color: "white", borderRadius: 4, marginBottom: 16 }}>
            {status.message}
          </div>
        )}

        {/* --- STRENGTH FORM --- */}
        {activeTab === "strength" && (
          <form onSubmit={handleStrengthSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ color: "white", fontSize: 18 }}>Log Strength Session</h3>
            <div className="hh-field">
              <label className="hh-field__label">Date</label>
              <input type="date" className="hh-input" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
            </div>
            <div className="hh-field">
              <label className="hh-field__label">Exercise</label>
              <select className="hh-input" value={strengthForm.exercise_id} onChange={(e) => setStrengthForm({ ...strengthForm, exercise_id: e.target.value })}>
                {/* Fallback mock exercises since we don't have an exercise fetch endpoint yet */}
                <option value="1">Bench Press</option>
                <option value="2">Squat</option>
                <option value="3">Deadlift</option>
                <option value="4">Overhead Press</option>
                <option value="5">Barbell Row</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Sets</label><input type="number" className="hh-input" placeholder="3" required value={strengthForm.sets} onChange={e => setStrengthForm({...strengthForm, sets: e.target.value})} /></div>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Reps</label><input type="number" className="hh-input" placeholder="10" required value={strengthForm.reps} onChange={e => setStrengthForm({...strengthForm, reps: e.target.value})} /></div>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Weight (lbs)</label><input type="number" className="hh-input" placeholder="135" value={strengthForm.weight} onChange={e => setStrengthForm({...strengthForm, weight: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Finish Workout"}</button>
          </form>
        )}

        {/* --- CARDIO FORM --- */}
        {activeTab === "cardio" && (
          <form onSubmit={handleCardioSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ color: "white", fontSize: 18 }}>Log Cardio</h3>
            <div className="hh-field">
              <label className="hh-field__label">Date</label>
              <input type="date" className="hh-input" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
            </div>
            <div className="hh-field">
              <label className="hh-field__label">Activity Type</label>
              <select className="hh-input" value={cardioForm.type} onChange={(e) => setCardioForm({ ...cardioForm, type: e.target.value })}>
                <option value="running">Running</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="rowing">Rowing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Duration (mins)</label><input type="number" className="hh-input" placeholder="30" required value={cardioForm.duration} onChange={e => setCardioForm({...cardioForm, duration: e.target.value})} /></div>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Distance (miles)</label><input type="number" step="0.1" className="hh-input" placeholder="3.1" value={cardioForm.distance} onChange={e => setCardioForm({...cardioForm, distance: e.target.value})} /></div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Avg Heart Rate (bpm)</label><input type="number" className="hh-input" placeholder="145" value={cardioForm.heartRate} onChange={e => setCardioForm({...cardioForm, heartRate: e.target.value})} /></div>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Calories Burned</label><input type="number" className="hh-input" placeholder="300" value={cardioForm.calories} onChange={e => setCardioForm({...cardioForm, calories: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Cardio Log"}</button>
          </form>
        )}

        {/* --- METRICS FORM --- */}
        {activeTab === "metrics" && (
          <form onSubmit={handleMetricsSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ color: "white", fontSize: 18 }}>Log Daily Metrics</h3>
            <div className="hh-field">
              <label className="hh-field__label">Date</label>
              <input type="date" className="hh-input" value={logDate} onChange={(e) => setLogDate(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Total Steps</label><input type="number" className="hh-input" placeholder="10000" value={metricsForm.steps} onChange={e => setMetricsForm({...metricsForm, steps: e.target.value})} /></div>
              <div className="hh-field" style={{ flex: 1 }}><label className="hh-field__label">Total Calorie Intake</label><input type="number" className="hh-input" placeholder="2200" value={metricsForm.calories} onChange={e => setMetricsForm({...metricsForm, calories: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Daily Metrics"}</button>
          </form>
        )}

        {/* --- HISTORY LIST --- */}
        {activeTab === "history" && (
          <div>
            <h3 style={{ color: "white", fontSize: 18, marginBottom: 16 }}>Activity History</h3>
            {logs.length === 0 ? (
              <p className="hh-portal-card-copy">No activity logged yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {logs.map((log: any) => (
                  <div key={log.log_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "var(--hh-bg-elevated)", borderRadius: 8 }}>
                    <div>
                      <p style={{ color: "white", fontWeight: 600, textTransform: "capitalize", marginBottom: 4 }}>
                        {log.activity_type} {log.cardio_type && `- ${log.cardio_type}`}
                      </p>
                      <p className="hh-portal-card-copy" style={{ fontSize: 14 }}>
                        {log.log_date} 
                        {log.activity_type === "strength" && ` • Sets: ${log.sets_completed} | Reps: ${log.reps_completed} | Wt: ${log.weight_used}`}
                        {log.activity_type === "cardio" && ` • Dur: ${log.duration_minutes}m | Dist: ${log.distance}`}
                        {log.activity_type === "steps" && ` • Steps: ${log.step_count}`}
                        {log.activity_type === "calories" && ` • Intake: ${log.calorie_intake} kcal`}
                      </p>
                      {log.notes && <p className="hh-text-muted" style={{ fontSize: 12, marginTop: 4 }}>{log.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(log.log_id)} className="btn btn--ghost" style={{ padding: 8, color: "#dc3545" }} title="Delete Entry">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </MemberPortalShell>
  );
}