"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Dumbbell, Plus } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { availabilityService, type AvailabilitySlot } from "@/services/availabilityService";
import { clientRequestService, type ClientRequest } from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

function formatTime(time: string) {
  const [hourPart, minutePart = "00"] = time.split(":");
  const hour = Number(hourPart);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutePart.slice(0, 2)} ${period}`;
}

export default function CoachSchedule() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadSchedule = async () => {
      try {
        setLoading(true);
        const [availabilityResponse, requestResponse] = await Promise.all([
          availabilityService.get(userId),
          clientRequestService.getAll(userId),
        ]);
        setAvailability(availabilityResponse.availability);
        setRequests(requestResponse.requests);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load schedule.");
      } finally {
        setLoading(false);
      }
    };

    void loadSchedule();
  }, [userId]);

  const acceptedRequests = requests.filter((request) => request.status === "accepted");
  const events = useMemo(() => {
    return DAYS.map((day) => ({
      day,
      slots: availability.filter((slot) => slot.day_of_week === day && slot.is_available),
      booked: acceptedRequests.filter((_, index) => index % DAYS.length === DAYS.indexOf(day)),
    }));
  }, [acceptedRequests, availability]);

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
              <h1 className="hh-page-title">WEEKLY CALENDAR</h1>
              <p className="hh-page-subtitle">Availability and accepted client sessions from the API</p>
            </div>
            <a className="btn btn--primary" href="/dashboards/coach/availability" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Plus size={14} /> Edit Availability
            </a>
          </div>

          {error ? <p className="hh-error-msg">{error}</p> : null}

          <div className="hh-card">
            {loading ? (
              <p className="hh-text-muted">Loading weekly calendar...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(140px, 1fr))", gap: 12, overflowX: "auto" }}>
                {events.map((column) => (
                  <section key={column.day} style={{ minHeight: 360, padding: 12, border: "1px solid var(--hh-border)", borderRadius: "var(--hh-radius-md)", background: "var(--hh-bg-card-dark)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <Calendar size={14} color="var(--hh-accent)" />
                      <h2 style={{ margin: 0, fontSize: 14, color: "var(--hh-text-primary)" }}>{column.day.slice(0, 3)}</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {column.slots.map((slot) => (
                        <div key={slot.availability_id ?? `${slot.day_of_week}-${slot.start_time}`} style={{ padding: 10, borderRadius: 10, background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74, 222, 128, 0.24)", color: "#4ade80", fontSize: 12 }}>
                          Open
                          <div style={{ color: "var(--hh-text-muted)", marginTop: 4 }}>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                        </div>
                      ))}

                      {column.booked.map((request) => (
                        <div key={request.request_id} style={{ padding: 10, borderRadius: 10, background: "var(--hh-accent-15)", border: "1px solid var(--hh-accent-30)", color: "var(--hh-accent-light)", fontSize: 12 }}>
                          {request.client_name ?? "Client Session"}
                          <div style={{ color: "var(--hh-text-muted)", marginTop: 4 }}>Accepted coaching client</div>
                        </div>
                      ))}

                      {column.slots.length === 0 && column.booked.length === 0 ? (
                        <p style={{ margin: 0, color: "var(--hh-text-muted)", fontSize: 12 }}>No availability</p>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
