"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Dumbbell, ArrowLeft } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import ActivityCharts, { type AggregateDay, type AggregateTotals, type AggregatePeriod } from "@/components/ActivityCharts";
import { apiClient } from "@/lib/api";
import { clientRequestService, type ClientFitnessGoal } from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";

interface AggregateResponse {
  period: string;
  start_date: string;
  end_date: string;
  client_id: number;
  totals: AggregateTotals;
  daily: AggregateDay[];
}

const EMPTY_TOTALS: AggregateTotals = {
  strength_sessions: 0,
  cardio_sessions: 0,
  cardio_minutes: 0,
  total_steps: 0,
  total_calories: 0,
  active_days: 0,
};

export default function CoachClientDetailPage() {
  const params = useParams();
  const clientId = Number(params.id);
  const coachUser = useAuthStore((s) => s.user);
  const coachId = coachUser?.id ?? coachUser?.user_id;

  const [period, setPeriod] = useState<AggregatePeriod>("week");
  const [aggregate, setAggregate] = useState<AggregateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pull client info (name, email, goal) from the coach's client list
  const [clientName, setClientName]   = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientGoal, setClientGoal]   = useState<ClientFitnessGoal | null>(null);

  useEffect(() => {
    if (!coachId) return;
    clientRequestService.getAll(coachId).then((res) => {
      const match = (res.requests ?? []).find((r) => r.client_id === clientId && r.is_active);
      if (match) {
        setClientName(match.client_name ?? "");
        setClientEmail(match.client_email ?? "");
        setClientGoal((match.fitness_goal as ClientFitnessGoal | null) ?? null);
      }
    }).catch(() => {});
  }, [coachId, clientId]);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    apiClient<AggregateResponse>(`coach/clients/${clientId}/aggregate?period=${period}`)
      .then((data) => { setAggregate(data); setError(""); })
      .catch(() => setError("Could not load client activity data."))
      .finally(() => setLoading(false));
  }, [clientId, period]);

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
          <a href="/" className="hh-sidebar__back">Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <a
              href="/dashboards/coach/clients"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--hh-text-muted)", marginBottom: 16, textDecoration: "none" }}
            >
              <ArrowLeft size={14} /> Back to My Clients
            </a>
            <h1 className="hh-page-title">{clientName || `Client #${clientId}`}</h1>
            <p className="hh-page-subtitle">{clientEmail}</p>
          </div>

          {/* Client goal */}
          {clientGoal && (
            <div className="hh-card" style={{ padding: "16px 20px" }}>
              <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Active Fitness Goal</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{clientGoal.goal_type}</span>
                {clientGoal.target_value != null && (
                  <span style={{ fontSize: 13, color: "var(--hh-text-muted)" }}>
                    Target: {clientGoal.target_value} {clientGoal.target_unit ?? ""}
                  </span>
                )}
                {clientGoal.deadline && (
                  <span style={{ fontSize: 13, color: "var(--hh-text-muted)" }}>
                    Deadline: {new Date(clientGoal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Activity charts */}
          <div className="hh-card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>Activity Overview</h2>
            {error ? (
              <p style={{ color: "var(--hh-error)", fontSize: 14 }}>{error}</p>
            ) : (
              <ActivityCharts
                daily={aggregate?.daily ?? []}
                totals={aggregate?.totals ?? EMPTY_TOTALS}
                period={period}
                onPeriodChange={setPeriod}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
