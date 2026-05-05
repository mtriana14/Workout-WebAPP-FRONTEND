"use client";

import { useEffect, useState } from "react";
import { Calendar, Dumbbell } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { availabilityService, type AvailabilitySlot } from "@/services/availabilityService";
import { clientDashboardService, type MyCoach, type ClientWorkoutPlan } from "@/services/clientDashboardService";
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

interface ParsedExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

interface DayWorkout {
  planName: string;
  exercises: ParsedExercise[];
}

function parseWorkoutsForDay(plans: ClientWorkoutPlan[], day: Day): DayWorkout[] {
  const results: DayWorkout[] = [];
  for (const plan of plans) {
    if (plan.status !== "active") continue;
    const desc = plan.description ?? "";
    const lines = desc.split("\n").map((l) => l.trim()).filter(Boolean);
    const daysLine = lines.find((l) => l.startsWith("Assigned days:"));
    if (!daysLine) continue;
    const assignedDays = daysLine.replace("Assigned days:", "").split(",").map((d) => d.trim());
    if (!assignedDays.includes(day)) continue;
    const exercises: ParsedExercise[] = lines
      .filter((l) => /^\d+\./.test(l))
      .map((line) => ({
        name: line.match(/^\d+\.\s+(.+?)\s+-\s+/)?.[1] ?? line,
        sets: Number(line.match(/(\d+)\s+sets/)?.[1] ?? 3),
        reps: line.match(/x\s+([\d\-–]+)/)?.[1] ?? "8-12",
        rest: line.match(/rest\s+(\S+)/)?.[1] ?? "60s",
      }));
    if (exercises.length > 0) {
      results.push({ planName: plan.name, exercises });
    }
  }
  return results;
}

export default function WeeklyCalendarPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? (user as any)?.user_id;

  const [coach, setCoach] = useState<MyCoach | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [plans, setPlans] = useState<ClientWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const [coachData, planData] = await Promise.all([
          clientDashboardService.getMyCoach(Number(userId)),
          clientDashboardService.getMyWorkoutPlans(Number(userId)),
        ]);

        setPlans(planData.workout_plans ?? []);

        if (coachData.coach) {
          setCoach(coachData.coach);
          const availData = await availabilityService.get(coachData.coach.user_id);
          setSlots(availData.availability ?? []);
        }
      } catch {
        // show whatever loaded
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId]);

  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const columns = DAYS.map((day) => ({
    day,
    isToday: day === todayName,
    coachSlots: slots.filter((s) => s.day_of_week === day && s.is_available),
    workouts: parseWorkoutsForDay(plans, day),
  }));

  const subtitle = coach
    ? `${coach.name}'s availability · your workout plan`
    : "Your weekly workout schedule";

  return (
    <MemberPortalShell activePage="calendar" title="WEEKLY SCHEDULE" subtitle={subtitle}>
      {loading ? (
        <div className="hh-card">
          <p style={{ color: "var(--hh-text-muted)" }}>Loading schedule...</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "var(--hh-text-muted)", flexWrap: "wrap" }}>
            {coach && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "rgba(74,222,128,0.5)", display: "inline-block" }} />
                Coach available
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "inline-block" }} />
              Your workout
            </span>
            {!coach && (
              <a href="/dashboards/client/coaches" style={{ color: "var(--hh-accent)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
                + Connect with a coach to see their availability
              </a>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(150px, 1fr))", gap: 12, minWidth: 1050 }}>
              {columns.map((col) => (
                <section
                  key={col.day}
                  style={{
                    minHeight: 240,
                    padding: 12,
                    border: col.isToday ? "1px solid var(--hh-accent)" : "1px solid var(--hh-border)",
                    borderRadius: "var(--hh-radius-md)",
                    background: col.isToday ? "rgba(139,92,246,0.04)" : "var(--hh-bg-card-dark)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* Day header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: col.isToday ? "var(--hh-accent)" : "var(--hh-text-primary)" }}>
                      {col.day.slice(0, 3).toUpperCase()}
                    </h2>
                    {col.isToday && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--hh-accent)", background: "rgba(139,92,246,0.15)", padding: "1px 6px", borderRadius: 4 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Coach availability — only when active coach */}
                  {coach && (
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 600, color: "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} color="var(--hh-text-muted)" />
                        Coach
                      </p>
                      {col.coachSlots.length === 0 ? (
                        <p style={{ margin: 0, color: "var(--hh-text-muted)", fontSize: 11 }}>Not available</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {col.coachSlots.map((slot) => (
                            <div
                              key={slot.availability_id ?? `${slot.day_of_week}-${slot.start_time}`}
                              style={{
                                padding: "6px 8px",
                                borderRadius: 8,
                                background: "rgba(74, 222, 128, 0.08)",
                                border: "1px solid rgba(74, 222, 128, 0.24)",
                                color: "#4ade80",
                                fontSize: 11,
                              }}
                            >
                              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider only when coach section is shown */}
                  {coach && <div style={{ borderTop: "1px solid var(--hh-border)" }} />}

                  {/* Workout plan — always shown */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 5px", fontSize: 10, fontWeight: 600, color: "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 4 }}>
                      <Dumbbell size={10} color="var(--hh-text-muted)" />
                      Workout
                    </p>
                    {col.workouts.length === 0 ? (
                      <p style={{ margin: 0, color: "var(--hh-text-muted)", fontSize: 11 }}>Rest day</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {col.workouts.map((workout, wi) => (
                          <div key={wi}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "var(--hh-accent-light)" }}>
                              {workout.planName}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {workout.exercises.map((ex, ei) => (
                                <div
                                  key={ei}
                                  style={{
                                    padding: "6px 8px",
                                    borderRadius: 8,
                                    background: "rgba(139,92,246,0.08)",
                                    border: "1px solid rgba(139,92,246,0.2)",
                                  }}
                                >
                                  <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: "var(--hh-text-primary)" }}>
                                    {ex.name}
                                  </p>
                                  <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--hh-text-muted)" }}>
                                    {ex.sets} sets × {ex.reps} · rest {ex.rest}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </MemberPortalShell>
  );
}
