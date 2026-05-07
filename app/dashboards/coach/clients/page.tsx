"use client";

import { useEffect, useMemo, useState } from "react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import {
  clientRequestService,
  type ClientRequest,
  type ClientFitnessGoal,
} from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell, ChevronDown, ChevronUp } from "lucide-react";

function statusColor(s: string) {
  if (s === "active")    return "#22c55e";
  if (s === "completed") return "#3b82f6";
  return "#6b7280";
}

export default function CoachClientsPage() {
  const user = useAuthStore((state) => state.user);
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);

  useEffect(() => {
    const coachId = user?.id ?? user?.user_id;
    if (!coachId) {
      setLoading(false);
      return;
    }

    const loadClients = async () => {
      try {
        const response = await clientRequestService.getAll(coachId);
        const acceptedClients = (response.requests ?? []).filter(
          (request) => request.is_active,
        );
        setClients(acceptedClients);
      } catch {
        setError("Failed to load clients.");
      } finally {
        setLoading(false);
      }
    };

    void loadClients();
  }, [user?.id, user?.user_id]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return clients;
    }

    return clients.filter((client) =>
      `${client.client_name ?? ""} ${client.client_email ?? ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [clients, search]);

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
            <h1 className="hh-page-title">MY CLIENTS</h1>
            <p className="hh-page-subtitle">
              Manage your active coaching clients.
            </p>
          </div>

          <div className="hh-card">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients by name or email"
              className="hh-input"
              style={{ maxWidth: 420 }}
            />
          </div>

          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--hh-border)",
              }}
            >
              <h2 className="hh-panel-heading">Active Clients</h2>
            </div>

            {loading ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>
                Loading clients...
              </p>
            ) : null}
            {error ? (
              <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>
            ) : null}

            {!loading && !error && filteredClients.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>
                {clients.length === 0
                  ? "No active clients yet."
                  : "No clients match your search."}
              </p>
            ) : null}

            {!loading && !error && filteredClients.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filteredClients.map((client, idx) => {
                  const goal = client.fitness_goal as ClientFitnessGoal | null | undefined;
                  const isExpanded = expandedGoal === client.request_id;
                  return (
                    <div
                      key={client.request_id}
                      style={{
                        padding: "16px 20px",
                        borderTop: idx === 0 ? "none" : "1px solid var(--hh-border)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <a
                            href={`/dashboards/coach/clients/${client.client_id}`}
                            style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--hh-text-primary)", textDecoration: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--hh-accent)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--hh-text-primary)")}
                          >
                            {client.client_name ?? `Client #${client.client_id}`}
                          </a>
                          <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>
                            {client.client_email ?? "No email provided"}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)" }}>
                          Client since {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {goal ? (
                        <div style={{ marginTop: 10 }}>
                          <button
                            onClick={() => setExpandedGoal(isExpanded ? null : client.request_id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "var(--hh-bg-card-dark)",
                              border: "none",
                              borderLeft: "2px solid var(--hh-accent)",
                              borderRadius: 6,
                              padding: "6px 10px",
                              fontSize: 13,
                              color: "var(--hh-text-primary)",
                              cursor: "pointer",
                              width: "100%",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ flex: 1 }}>{goal.goal_type}</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `${statusColor(goal.status)}20`, color: statusColor(goal.status), fontWeight: 500 }}>
                              {goal.status}
                            </span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div style={{ marginTop: 8, padding: "10px 12px", background: "var(--hh-bg-card-dark)", borderRadius: 6, display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, color: "var(--hh-text-muted)" }}>
                              {goal.target_value != null && (
                                <span><strong style={{ color: "var(--hh-text-primary)" }}>Target:</strong> {goal.target_value} {goal.target_unit ?? ""}</span>
                              )}
                              {goal.deadline && (
                                <span><strong style={{ color: "var(--hh-text-primary)" }}>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}</span>
                              )}
                              <span><strong style={{ color: "var(--hh-text-primary)" }}>Added:</strong> {new Date(goal.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--hh-text-muted)", fontStyle: "italic" }}>No active goal</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
