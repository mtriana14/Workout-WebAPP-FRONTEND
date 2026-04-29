"use client";

import { useEffect, useMemo, useState } from "react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { clientRequestService, type ClientRequest } from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell } from "lucide-react";

export default function CoachClientsPage() {
  const user = useAuthStore((state) => state.user);
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const coachId = user?.id ?? user?.user_id;
    if (!coachId) {
      setLoading(false);
      return;
    }

    const loadClients = async () => {
      try {
        const response = await clientRequestService.getAll(coachId);
        const acceptedClients = (response.requests ?? []).filter((request) => request.status === "accepted");
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
      `${client.client_name ?? ""} ${client.client_email ?? ""}`.toLowerCase().includes(query),
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
          <span className="hh-badge hh-badge--sm">Client Portal</span>
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
            <p className="hh-page-subtitle">Manage your active coaching clients.</p>
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
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h2 className="hh-panel-heading">Active Clients</h2>
            </div>

            {loading ? <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading clients...</p> : null}
            {error ? <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p> : null}

            {!loading && !error && filteredClients.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>
                {clients.length === 0 ? "No active clients yet." : "No clients match your search."}
              </p>
            ) : null}

            {!loading && !error && filteredClients.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, backgroundColor: "var(--hh-border)" }}>
                {filteredClients.map((client) => (
                  <div key={client.request_id} style={{ padding: 20, backgroundColor: "var(--hh-bg-primary)" }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                      {client.client_name ?? `Client #${client.client_id}`}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>
                      {client.client_email ?? "No email provided"}
                    </p>
                    <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                      Client since {new Date(client.created_at).toLocaleDateString()}
                    </p>
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
