"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Dumbbell, Plus } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { availabilityService, type AvailabilitySlot } from "@/services/availabilityService";
import { clientRequestService, type ClientRequest } from "@/services/ClientRequest";
import { workoutPlanService } from "@/services/workoutPlanService";
import { useAuthStore } from "@/store/authStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Day = (typeof DAYS)[number];

function formatTime(time: string) {
  const [hourPart, minutePart = "00"] = time.split(":");
  const hour = Number(hourPart);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutePart.slice(0, 2)} ${period}`;
}

interface DayExercise { name: string; sets: string; reps: string }
interface ClientDaySchedule { day: Day; planName: string; exercises: DayExercise[] }

function parseClientSchedule(plans: { name: string; description: string | null; status: string }[]): ClientDaySchedule[] {
  const result: ClientDaySchedule[] = [];
  for (const plan of plans) {
    if (plan.status !== "active") continue;
    const lines = (plan.description ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    const daysLine = lines.find((l) => l.startsWith("Assigned days:"));
    if (!daysLine) continue;
    const assignedDays = daysLine.replace("Assigned days:", "").split(",").map((d) => d.trim());
    const exercises: DayExercise[] = lines
      .filter((l) => /^\d+\./.test(l))
      .map((line) => ({
        name: line.match(/^\d+\.\s+(.+?)\s+-\s+/)?.[1] ?? line,
        sets: line.match(/(\d+)\s+sets/)?.[1] ?? "3",
        reps: line.match(/x\s+([\d\-–]+)/)?.[1] ?? "8-12",
      }));
    for (const day of assignedDays) {
      if (DAYS.includes(day as Day)) {
        result.push({ day: day as Day, planName: plan.name, exercises });
      }
    }
  }
  return result;
}

export default function CoachSchedule() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [clientSchedules, setClientSchedules] = useState<Record<number, ClientDaySchedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const loadSchedule = async () => {
      setLoading(true);
      setError("");

      const [availResult, requestResult] = await Promise.allSettled([
        availabilityService.get(userId),
        clientRequestService.getAll(userId),
      ]);

      if (availResult.status === "fulfilled") {
        setAvailability(availResult.value.availability);
      }

      const activeClients = availResult.status === "rejected" ? [] :
        requestResult.status === "fulfilled"
          ? (requestResult.value.requests ?? []).filter((r) => r.is_active)
          : [];

      if (requestResult.status === "fulfilled") {
        const active = (requestResult.value.requests ?? []).filter((r) => r.is_active);
        setClients(active);

        // Fetch each client's workout plans
        const planResults = await Promise.allSettled(
          active.map((c) => workoutPlanService.getByClient(userId, c.client_id))
        );

        const scheduleMap: Record<number, ClientDaySchedule[]> = {};
        planResults.forEach((res, i) => {
          scheduleMap[active[i].client_id] =
            res.status === "fulfilled"
              ? parseClientSchedule(res.value.workout_plans ?? [])
              : [];
        });
        setClientSchedules(scheduleMap);
      }

      if (availResult.status === "rejected" && requestResult.status === "rejected") {
        setError("Unable to load schedule.");
      }

      setLoading(false);
    };

    void loadSchedule();
  }, [userId]);

  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const availabilityColumns = useMemo(() =>
    DAYS.map((day) => ({
      day,
      isToday: day === todayName,
      slots: availability.filter((s) => s.day_of_week === day && s.is_available),
    })),
    [availability, todayName]
  );

  // Build per-day list of { client, plans[] } for the client schedule section
  const clientDayMap = useMemo(() => {
    const map: Record<Day, { client: ClientRequest; planName: string; exercises: DayExercise[] }[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
    };
    for (const client of clients) {
      const schedule = clientSchedules[client.client_id] ?? [];
      for (const entry of schedule) {
        map[entry.day].push({ client, planName: entry.planName, exercises: entry.exercises });
      }
    }
    return map;
  }, [clients, clientSchedules]);

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

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 className="hh-page-title">WEEKLY SCHEDULE</h1>
              <p className="hh-page-subtitle">Your availability and client workout schedules</p>
            </div>
            <a className="btn btn--primary" href="/dashboards/coach/availability" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Plus size={14} /> Edit Availability
            </a>
          </div>

          {error ? <p className="hh-error-msg">{error}</p> : null}

          {loading ? (
            <div className="hh-card">
              <p className="hh-text-muted">Loading schedule...</p>
            </div>
          ) : (
            <>
              {/* ── My Availability grid ── */}
              <div className="hh-card" style={{ padding: "16px 20px 20px" }}>
                <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 600, color: "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                  <Calendar size={12} color="var(--hh-text-muted)" />
                  My Availability
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(120px, 1fr))", gap: 10, overflowX: "auto" }}>
                  {availabilityColumns.map((col) => (
                    <section
                      key={col.day}
                      style={{
                        minHeight: 120, padding: 10,
                        border: col.isToday ? "1px solid var(--hh-accent)" : "1px solid var(--hh-border)",
                        borderRadius: "var(--hh-radius-md)",
                        background: col.isToday ? "rgba(139,92,246,0.04)" : "var(--hh-bg-card-dark)",
                      }}
                    >
                      <h2 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: col.isToday ? "var(--hh-accent)" : "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {col.day.slice(0, 3)}
                        {col.isToday && <span style={{ marginLeft: 5, fontSize: 9, background: "rgba(139,92,246,0.2)", color: "var(--hh-accent)", padding: "1px 5px", borderRadius: 4 }}>TODAY</span>}
                      </h2>
                      {col.slots.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 11, color: "var(--hh-text-muted)" }}>Off</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {col.slots.map((slot) => (
                            <div
                              key={slot.availability_id ?? `${slot.day_of_week}-${slot.start_time}`}
                              style={{ padding: "5px 8px", borderRadius: 7, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.24)", color: "#4ade80", fontSize: 11 }}
                            >
                              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </div>

              {/* ── Client Schedules list ── */}
              <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Dumbbell size={14} color="var(--hh-accent)" />
                  <h2 className="hh-panel-heading" style={{ margin: 0 }}>Client Workout Schedules</h2>
                </div>

                {clients.length === 0 ? (
                  <p style={{ padding: 24, color: "var(--hh-text-muted)", fontSize: 14 }}>No active clients yet.</p>
                ) : (
                  DAYS.map((day) => {
                    const entries = clientDayMap[day];
                    return (
                      <div key={day} style={{ borderBottom: "1px solid var(--hh-border)" }}>
                        {/* Day row header */}
                        <div style={{ padding: "10px 20px", background: "var(--hh-bg-card-dark)", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: day === todayName ? "var(--hh-accent)" : "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 36 }}>
                            {day.slice(0, 3)}
                          </span>
                          {day === todayName && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--hh-accent)", background: "rgba(139,92,246,0.15)", padding: "1px 6px", borderRadius: 4 }}>
                              TODAY
                            </span>
                          )}
                          {entries.length === 0 && (
                            <span style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>No clients working out</span>
                          )}
                        </div>

                        {/* Client entries for this day */}
                        {entries.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {entries.map(({ client, planName, exercises }, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: "12px 20px 12px 56px",
                                  borderTop: i > 0 ? "1px solid var(--hh-border)" : undefined,
                                  display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap",
                                }}
                              >
                                {/* Client name */}
                                <div style={{ minWidth: 160 }}>
                                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>
                                    {client.client_name ?? `Client #${client.client_id}`}
                                  </p>
                                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--hh-text-muted)" }}>
                                    {planName}
                                  </p>
                                </div>

                                {/* Exercises */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: 1 }}>
                                  {exercises.map((ex, ei) => (
                                    <span
                                      key={ei}
                                      style={{
                                        fontSize: 11, padding: "4px 10px", borderRadius: 20,
                                        background: "rgba(139,92,246,0.08)",
                                        border: "1px solid rgba(139,92,246,0.2)",
                                        color: "var(--hh-text-primary)",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {ex.name} · {ex.sets}×{ex.reps}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
