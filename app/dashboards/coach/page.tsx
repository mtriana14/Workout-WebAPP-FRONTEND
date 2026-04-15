"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_COACH } from "@/router/router";
 import { useAuthStore } from "@/store/authStore";
import { ClientRequest, clientRequestService } from "@/services/ClientRequest";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

export default function CoachDashboardPage() {
  const { user } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const coachId = user?.id;

  useEffect(() => {
    const loadData = async () => {
      if (!coachId) return;
      try {
        const data = await clientRequestService.getPending(coachId);
         
        setPendingRequests(data.requests);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [coachId]);

  return (
    <div className="hh-dash-root">
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
          <div>
            <h1 className="hh-page-title">COACH DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {user?.name || "Coach"}!</p>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pending Requests
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-warning)" }}>
                {loading ? "..." : pendingRequests.length}
              </p>
            </div>

            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Clients
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>
                {loading ? "..." : "—"}
              </p>
            </div>

            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                This Month Earnings
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0" }}>
                {loading ? "..." : "—"}
              </p>
            </div>
          </div>

          {/* Pending Requests Preview */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ 
              padding: "16px 20px", 
              borderBottom: "1px solid var(--hh-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recent Client Requests</h3>
              <a 
                href="/dashboards/coach/requests" 
                style={{ 
                  fontSize: 13, 
                  color: "var(--hh-accent)", 
                  textDecoration: "none",
                  fontWeight: 500
                }}
              >
                View All →
              </a>
            </div>

            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading...</p>
            )}

            {!loading && pendingRequests.length === 0 && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>
                No pending requests
              </p>
            )}

            {!loading && pendingRequests.length > 0 && (
              <div>
                {pendingRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.request_id}
                    style={{
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--hh-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "var(--hh-accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                      >
                        {req.client_name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                          {req.client_name || `Client #${req.client_id}`}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)" }}>
                          {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: "rgba(234, 179, 8, 0.1)",
                        color: "var(--hh-warning)",
                      }}
                    >
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="hh-card" style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Quick Actions</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <a
                href="/dashboards/coach/requests"
                style={{
                  padding: "12px 20px",
                  backgroundColor: "var(--hh-accent)",
                  color: "white",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                View Requests
              </a>
              <a
                href="/dashboards/coach/availability"
                style={{
                  padding: "12px 20px",
                  border: "1px solid var(--hh-border)",
                  color: "var(--hh-text-primary)",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Set Availability
              </a>
              <a
                href="/dashboards/coach/clients"
                style={{
                  padding: "12px 20px",
                  border: "1px solid var(--hh-border)",
                  color: "var(--hh-text-primary)",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                My Clients
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}