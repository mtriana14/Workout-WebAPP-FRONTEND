"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { useAuthStore } from "@/store/authStore";
import { ClientRequest, clientRequestService } from "@/services/ClientRequest";
import { NAV_ITEMS_COACH } from "@/router/router";
import { Dumbbell } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: "rgba(234, 179, 8, 0.1)",  color: "var(--hh-warning)",    label: "Pending" },
  accepted: { bg: "rgba(34, 197, 94, 0.1)",  color: "var(--hh-text-green)", label: "Accepted" },
  declined: { bg: "rgba(239, 68, 68, 0.1)",  color: "var(--hh-error)",      label: "Declined" },
};

export default function ClientRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const coachId = user?.id ?? user?.user_id;

  const loadRequests = async () => {
    if (!coachId) return;
    try {
      setLoading(true);
      const data = await clientRequestService.getAll(coachId);
      setRequests(data.requests);
    } catch {
      setError("Failed to load client requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coachId) {
      loadRequests();
    }
  }, [coachId]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle accept/decline (UC 9.4)
  const handleRespond = async (
    requestId: number,
    action: "accepted" | "declined",
  ) => {
    setActionLoading(requestId);
    try {
      console.log(requestId, action);
      await clientRequestService.respond(requestId, action);
      showToast(`Request ${action} successfully`, "success");
      loadRequests();
    } catch {
      showToast(`Failed to ${action} request`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter requests
  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  // Count by status
  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    declined: requests.filter((r) => r.status === "declined").length,
  };

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
            backgroundColor:
              toast.type === "success"
                ? "var(--hh-text-green)"
                : "var(--hh-error)",
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
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">CLIENT REQUESTS</h1>
            <p className="hh-page-subtitle">
              Review and respond to client coaching requests
            </p>
          </div>

          {/* Stats Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                label: "Total",
                value: counts.all,
                color: "var(--hh-text-primary)",
                key: "all",
              },
              {
                label: "Pending",
                value: counts.pending,
                color: "var(--hh-warning)",
                key: "pending",
              },
              {
                label: "Accepted",
                value: counts.accepted,
                color: "var(--hh-text-green)",
                key: "accepted",
              },
              {
                label: "Declined",
                value: counts.declined,
                color: "var(--hh-error)",
                key: "declined",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                onClick={() => setFilter(stat.key)}
                className="hh-card"
                style={{
                  padding: "20px",
                  textAlign: "center",
                  cursor: "pointer",
                  border:
                    filter === stat.key
                      ? `2px solid ${stat.color}`
                      : "2px solid transparent",
                  transition: "border-color 0.2s",
                }}
              >
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: stat.color,
                    margin: 0,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--hh-text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Requests List */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--hh-border)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {filter === "all"
                  ? "All Requests"
                  : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
              </h3>
            </div>

            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>
                Loading requests...
              </p>
            )}
            {error && (
              <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
              <p
                style={{
                  padding: 24,
                  color: "var(--hh-text-muted)",
                  textAlign: "center",
                }}
              >
                No {filter !== "all" ? filter : ""} requests found.
              </p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {filtered.map((req) => {
                  const status = STATUS_STYLES[req.status];
                  const isLoading = actionLoading === req.request_id;

                  return (
                    <div
                      key={req.request_id}
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid var(--hh-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 20,
                      }}
                    >
                      {/* Client Info */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: "var(--hh-accent)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              fontSize: 14,
                            }}
                          >
                            {req.client_name?.charAt(0) || "C"}
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            >
                              {req.client_name || `Client #${req.client_id}`}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "var(--hh-text-muted)",
                              }}
                            >
                              {req.client_email || "No email"}
                            </p>
                          </div>
                        </div>

                        {req.message && (
                          <div
                            style={{
                              padding: "12px 16px",
                              backgroundColor: "var(--hh-bg-secondary)",
                              borderRadius: 8,
                              marginTop: 12,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                color: "var(--hh-text-secondary)",
                                fontStyle: "italic",
                              }}
                            >
                              "{req.message}"
                            </p>
                          </div>
                        )}

                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: 12,
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          Received:{" "}
                          {new Date(req.created_at).toLocaleDateString()} at{" "}
                          {new Date(req.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Status & Actions */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>

                        {req.status === "pending" && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() =>
                                handleRespond(req.request_id, "accepted")
                              }
                              disabled={isLoading}
                              style={{
                                padding: "8px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                border: "none",
                                borderRadius: 6,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                backgroundColor: "var(--hh-text-green)",
                                color: "white",
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? "..." : "Accept"}
                            </button>
                            <button
                              onClick={() =>
                                handleRespond(req.request_id, "declined")
                              }
                              disabled={isLoading}
                              style={{
                                padding: "8px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                border: "1px solid var(--hh-error)",
                                borderRadius: 6,
                                cursor: isLoading ? "not-allowed" : "pointer",
                                backgroundColor: "transparent",
                                color: "var(--hh-error)",
                                opacity: isLoading ? 0.6 : 1,
                              }}
                            >
                              {isLoading ? "..." : "Decline"}
                            </button>
                          </div>
                        )}

                        {req.responded_at && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              color: "var(--hh-text-muted)",
                            }}
                          >
                            Responded:{" "}
                            {new Date(req.responded_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
