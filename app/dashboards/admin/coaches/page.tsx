"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { coachService } from "@/services/coachService";
import { CoachItem } from "@/types/CoachItem";
import { Dumbbell } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: "rgba(34, 197, 94, 0.1)",  color: "var(--hh-text-green)", label: "Approved" },
  pending:  { bg: "rgba(234, 179, 8, 0.1)",  color: "var(--hh-warning)",    label: "Pending" },
  rejected: { bg: "rgba(239, 68, 68, 0.1)",  color: "var(--hh-error)",      label: "Rejected" },
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const data = await coachService.getAll();
      setCoaches(data.coaches);
    } catch {
      setError("Failed to load coaches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle status change (UC 10.2 & 10.3)
  const handleUpdateStatus = async (coachId: number, action: "approved" | "rejected") => {
    setActionLoading(coachId);
    try {
      await coachService.updateStatus(coachId, action);
      showToast(`Coach ${action} successfully`, "success");
      loadCoaches();
    } catch {
      showToast(`Failed to update coach status`, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter coaches
  const filtered = coaches.filter((c) => {
    const matchesSearch = `${c.name} ${c.email} ${c.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Count by status
  const counts = {
    all: coaches.length,
    pending: coaches.filter((c) => c.status === "pending").length,
    approved: coaches.filter((c) => c.status === "approved").length,
    rejected: coaches.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="hh-dash-root">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            borderRadius: 8,
            backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)",
            color: "white",
            fontFamily: "var(--hh-font-body)",
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

        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">COACHES</h1>
            <p className="hh-page-subtitle">Review registrations and manage coach accounts</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { label: "Total", value: counts.all, color: "var(--hh-text-primary)" },
              { label: "Pending", value: counts.pending, color: "var(--hh-warning)" },
              { label: "Approved", value: counts.approved, color: "var(--hh-text-green)" },
              { label: "Rejected", value: counts.rejected, color: "var(--hh-error)" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="hh-card"
                style={{ padding: "20px", textAlign: "center" }}
              >
                <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, margin: 0 }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="hh-card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by name, email or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hh-input"
              style={{ flex: 1, maxWidth: 400 }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="hh-input"
              style={{ width: 160 }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading coaches...</p>
            )}
            {error && <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>}
            {!loading && !error && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hh-border)" }}>
                    {["Name", "Email", "Specialization", "Status", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontFamily: "var(--hh-font-body)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--hh-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}
                      >
                        No coaches found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((c) => {
                    const status = STATUS_STYLES[c.status] ?? {
                      bg: "transparent",
                      color: "var(--hh-text-muted)",
                      label: c.status,
                    };
                    const isLoading = actionLoading === c.id;

                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--hh-border)" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-primary)" }}>
                          {c.name}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                          {c.email}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, textTransform: "capitalize" }}>
                          {c.specialization}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: status.bg,
                              color: status.color,
                            }}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            {/* Pending: Show Approve/Reject (UC 10.2) */}
                            {c.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(c.id, "approved")}
                                  disabled={isLoading}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    backgroundColor: "var(--hh-text-green)",
                                    color: "white",
                                    opacity: isLoading ? 0.6 : 1,
                                  }}
                                >
                                  {isLoading ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(c.id, "rejected")}
                                  disabled={isLoading}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    backgroundColor: "var(--hh-error)",
                                    color: "white",
                                    opacity: isLoading ? 0.6 : 1,
                                  }}
                                >
                                  {isLoading ? "..." : "Reject"}
                                </button>
                              </>
                            )}

                            {/* Approved: Show Disable (UC 10.3) */}
                            {c.status === "approved" && (
                              <button
                                onClick={() => handleUpdateStatus(c.id, "rejected")}
                                disabled={isLoading}
                                style={{
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: "1px solid var(--hh-error)",
                                  borderRadius: 6,
                                  cursor: isLoading ? "not-allowed" : "pointer",
                                  backgroundColor: "transparent",
                                  color: "var(--hh-error)",
                                  opacity: isLoading ? 0.6 : 1,
                                }}
                              >
                                {isLoading ? "..." : "Disable"}
                              </button>
                            )}

                            {/* Rejected: No actions */}
                            {c.status === "rejected" && (
                              <span style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
