"use client";

import { useEffect, useState } from "react";
import { ClipboardList, DollarSign, Users, type LucideIcon } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { coachDashboardService, type CoachDashboard } from "@/services/coachDashboardService";
import { clientRequestService, type ClientRequest } from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell } from "lucide-react";

interface CoachCard {
  label: string;
  icon: LucideIcon;
  value: string;
  helper: string;
}

function emptyDashboard(coachId: number): CoachDashboard {
  return {
    coach_id: coachId,
    active_clients: {
      count: 0,
      new_this_month: 0,
    },
    earnings: {
      this_month: 0,
      last_month: 0,
      change_pct: null,
    },
    monthly_revenue: [],
    recent_activity: [],
  };
}

export default function CoachDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [pendingRequests, setPendingRequests] = useState<ClientRequest[]>([]);
  const [dashboard, setDashboard] = useState<CoachDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const displayName = user?.first_name ?? user?.firstName ?? user?.name ?? "Coach";

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!token) {
      setError("Sign in as a coach to view your dashboard.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const dashboardResponse = await coachDashboardService.get();
        setDashboard(dashboardResponse);
        try {
          const requestResponse = await clientRequestService.getPending(Number(user?.id ?? user?.user_id ?? 0));
          setPendingRequests(requestResponse.requests ?? []);
        } catch {
          setPendingRequests([]);
        }
      } catch {
        const fallbackCoachId = Number(user?.id ?? user?.user_id ?? 0);
        setDashboard(emptyDashboard(fallbackCoachId));
        setPendingRequests([]);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [hasHydrated, token]);

  const cards: CoachCard[] = [
    {
      label: "Pending Requests",
      icon: ClipboardList,
      value: loading ? "..." : String(pendingRequests.length),
      helper: "Requests waiting for your response",
    },
    {
      label: "Active Clients",
      icon: Users,
      value: loading ? "..." : String(dashboard?.active_clients.count ?? 0),
      helper: `${dashboard?.active_clients.new_this_month ?? 0} new this month`,
    },
    {
      label: "Revenue",
      icon: DollarSign,
      value: loading ? "..." : `$${(dashboard?.earnings.this_month ?? 0).toLocaleString()}`,
      helper: "This month",
    },
  ];

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
          <a href="/" className="hh-sidebar__back">
            Back to Home
          </a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">COACH DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {displayName}.</p>
          </div>
          {error ? <p className="hh-error-msg">{error}</p> : null}

          <div className="hh-stats-grid">
            {cards.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                  <div className="hh-card__icon">
                    <card.icon size={16} color="var(--hh-text-muted)" />
                  </div>
                </div>
                <p className="hh-card__value">{card.value}</p>
                <p className="hh-card__delta hh-text-muted">{card.helper}</p>
              </div>
            ))}
          </div>

          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--hh-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="hh-panel-heading">Recent Requests</h2>
              <a href="/dashboards/coach/requests" className="hh-portal-inline-link">
                View All
              </a>
            </div>

            {loading ? <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading requests...</p> : null}

            {!loading && pendingRequests.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>No pending client requests.</p>
            ) : null}

            {!loading && pendingRequests.length > 0 ? (
              <div>
                {pendingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.request_id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--hh-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                        {request.client_name ?? `Client #${request.client_id}`}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                        {request.client_email ?? "No email provided"}
                      </p>
                    </div>
                    <span className="hh-portal-pill">Pending</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
