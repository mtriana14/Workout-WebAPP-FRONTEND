"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { availabilityService, type AvailabilitySlot } from "@/services/availabilityService";
import { clientDashboardService, type MyCoach } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

function formatTime(time: string) {
  const [hourPart, minutePart = "00"] = time.split(":");
  const hour = Number(hourPart);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutePart.slice(0, 2)} ${period}`;
}

type Status = "loading" | "no-coach" | "ready" | "error";

export default function WeeklyCalendarPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? (user as any)?.user_id;

  const [coach, setCoach] = useState<MyCoach | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const coachData = await clientDashboardService.getMyCoach(Number(userId));
        if (!coachData.coach) {
          setStatus("no-coach");
          return;
        }

        setCoach(coachData.coach);

        const availData = await availabilityService.get(coachData.coach.user_id);
        setSlots(availData.availability ?? []);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };

    void load();
  }, [userId]);

  const columns = DAYS.map((day) => ({
    day,
    slots: slots.filter((s) => s.day_of_week === day && s.is_available),
  }));

  const subtitle = coach
    ? `${coach.name}'s weekly availability`
    : "Your coach's weekly schedule";

  return (
    <MemberPortalShell activePage="calendar" title="COACH SCHEDULE" subtitle={subtitle}>
      {status === "loading" && (
        <div className="hh-card">
          <p style={{ color: "var(--hh-text-muted)" }}>Loading schedule...</p>
        </div>
      )}

      {status === "no-coach" && (
        <div className="hh-card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--hh-text-muted)", marginBottom: 16 }}>
            You haven&apos;t connected with a coach yet. Find one to see their schedule here.
          </p>
          <a href="/dashboards/client/coaches" className="btn btn--primary">
            Find a Coach
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="hh-card">
          <p style={{ color: "var(--hh-error)" }}>Failed to load schedule. Please try again.</p>
        </div>
      )}

      {status === "ready" && (
        <div className="hh-card">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(130px, 1fr))", gap: 12, overflowX: "auto" }}>
            {columns.map((col) => (
              <section
                key={col.day}
                style={{
                  minHeight: 240,
                  padding: 12,
                  border: "1px solid var(--hh-border)",
                  borderRadius: "var(--hh-radius-md)",
                  background: "var(--hh-bg-card-dark)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Calendar size={14} color="var(--hh-accent)" />
                  <h2 style={{ margin: 0, fontSize: 14, color: "var(--hh-text-primary)" }}>
                    {col.day.slice(0, 3)}
                  </h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.slots.length === 0 ? (
                    <p style={{ margin: 0, color: "var(--hh-text-muted)", fontSize: 12 }}>
                      Not available
                    </p>
                  ) : (
                    col.slots.map((slot) => (
                      <div
                        key={slot.availability_id ?? `${slot.day_of_week}-${slot.start_time}`}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          background: "rgba(74, 222, 128, 0.08)",
                          border: "1px solid rgba(74, 222, 128, 0.24)",
                          color: "#4ade80",
                          fontSize: 12,
                        }}
                      >
                        Available
                        <div style={{ color: "var(--hh-text-muted)", marginTop: 4 }}>
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </MemberPortalShell>
  );
}
