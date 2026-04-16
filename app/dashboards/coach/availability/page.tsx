"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_COACH } from "@/router/router";
import { availabilityService, AvailabilitySlot } from "@/services/availabilityService";
import { useAuthStore } from "@/store/authStore";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
] as const;

type DayOfWeek = typeof DAYS_OF_WEEK[number];

interface DaySchedule {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

const DEFAULT_SCHEDULE: Record<DayOfWeek, DaySchedule> = {
  Monday:    { enabled: false, start_time: "09:00", end_time: "17:00" },
  Tuesday:   { enabled: false, start_time: "09:00", end_time: "17:00" },
  Wednesday: { enabled: false, start_time: "09:00", end_time: "17:00" },
  Thursday:  { enabled: false, start_time: "09:00", end_time: "17:00" },
  Friday:    { enabled: false, start_time: "09:00", end_time: "17:00" },
  Saturday:  { enabled: false, start_time: "10:00", end_time: "14:00" },
  Sunday:    { enabled: false, start_time: "10:00", end_time: "14:00" },
};

export default function AvailabilityPage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<Record<DayOfWeek, DaySchedule>>(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const userId = user?.id;

  // Load existing availability
  useEffect(() => {
    const loadAvailability = async () => {
      if (!userId) return;
      try {
        const data = await availabilityService.get(userId);
        
        // Convert API response to schedule format
        const newSchedule = { ...DEFAULT_SCHEDULE };
        data.availability.forEach((slot) => {
          const day = slot.day_of_week as DayOfWeek;
          newSchedule[day] = {
            enabled: slot.is_available,
            start_time: slot.start_time.substring(0, 5), // "HH:MM:SS" -> "HH:MM"
            end_time: slot.end_time.substring(0, 5),
          };
        });
        setSchedule(newSchedule);
      } catch (err) {
        console.error("Failed to load availability", err);
      } finally {
        setLoading(false);
      }
    };
    loadAvailability();
  }, [userId]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle day enabled/disabled
  const toggleDay = (day: DayOfWeek) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  // Update time for a day
  const updateTime = (day: DayOfWeek, field: "start_time" | "end_time", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Save availability
  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      // Convert schedule to API format
      const slots: Omit<AvailabilitySlot, "availability_id">[] = DAYS_OF_WEEK
        .filter((day) => schedule[day].enabled)
        .map((day) => ({
          day_of_week: day,
          start_time: schedule[day].start_time,
          end_time: schedule[day].end_time,
          is_available: true,
        }));

      await availabilityService.set(userId, slots);
      showToast("Availability saved successfully", "success");
    } catch {
      showToast("Failed to save availability", "error");
    } finally {
      setSaving(false);
    }
  };

  // Count active days
  const activeDays = DAYS_OF_WEEK.filter((day) => schedule[day].enabled).length;

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
            backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)",
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

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="hh-page-title">AVAILABILITY</h1>
              <p className="hh-page-subtitle">Set your weekly coaching schedule</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: 8,
                background: "var(--hh-accent)",
                color: "white",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Summary Card */}
          <div className="hh-card" style={{ padding: 20, display: "flex", gap: 24 }}>
            <div>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>
                Active Days
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, margin: "4px 0 0", color: "var(--hh-text-green)" }}>
                {activeDays} / 7
              </p>
            </div>
            <div style={{ borderLeft: "1px solid var(--hh-border)", paddingLeft: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase" }}>
                Status
              </p>
              <p style={{ fontSize: 16, fontWeight: 600, margin: "8px 0 0" }}>
                {activeDays > 0 ? "Accepting clients" : "Not available"}
              </p>
            </div>
          </div>

          {/* Schedule */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Weekly Schedule</h3>
            </div>

            {loading ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading...</p>
            ) : (
              <div>
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--hh-border)",
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      backgroundColor: schedule[day].enabled ? "transparent" : "var(--hh-bg-secondary)",
                    }}
                  >
                    {/* Toggle */}
                    <button
                      onClick={() => toggleDay(day)}
                      style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: schedule[day].enabled ? "var(--hh-text-green)" : "var(--hh-border)",
                        position: "relative",
                        transition: "background-color 0.2s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 3,
                          left: schedule[day].enabled ? 23 : 3,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          backgroundColor: "white",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </button>

                    {/* Day Name */}
                    <span
                      style={{
                        width: 100,
                        fontSize: 14,
                        fontWeight: 600,
                        color: schedule[day].enabled ? "var(--hh-text-primary)" : "var(--hh-text-muted)",
                      }}
                    >
                      {day}
                    </span>

                    {/* Time Inputs */}
                    {schedule[day].enabled ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="time"
                          value={schedule[day].start_time}
                          onChange={(e) => updateTime(day, "start_time", e.target.value)}
                          className="hh-input"
                          style={{ width: 130, padding: "8px 12px" }}
                        />
                        <span style={{ color: "var(--hh-text-muted)" }}>to</span>
                        <input
                          type="time"
                          value={schedule[day].end_time}
                          onChange={(e) => updateTime(day, "end_time", e.target.value)}
                          className="hh-input"
                          style={{ width: 130, padding: "8px 12px" }}
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: 14, color: "var(--hh-text-muted)" }}>Not available</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="hh-card" style={{ padding: 20, backgroundColor: "rgba(234, 179, 8, 0.05)" }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-secondary)" }}>
              <strong>Tip:</strong> Clients will see your availability when browsing coaches. 
              Keep your schedule up to date to receive relevant coaching requests.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}