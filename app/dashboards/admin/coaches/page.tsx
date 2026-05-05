"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { coachService } from "@/services/coachService";
import { Dumbbell } from "lucide-react";

interface AdminCoachRow {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  status: string;
  created_at: string;
  recordType: "registration" | "coach";
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: "rgba(34, 197, 94, 0.1)",   color: "var(--hh-text-green)",  label: "Active" },
  approved:  { bg: "rgba(34, 197, 94, 0.1)",   color: "var(--hh-text-green)",  label: "Approved" },
  pending:   { bg: "rgba(234, 179, 8, 0.1)",   color: "var(--hh-warning)",     label: "Pending" },
  rejected:  { bg: "rgba(239, 68, 68, 0.1)",   color: "var(--hh-error)",       label: "Rejected" },
  suspended: { bg: "rgba(234, 179, 8, 0.1)",   color: "var(--hh-warning)",     label: "Suspended" },
  disabled:  { bg: "rgba(100, 100, 100, 0.1)", color: "var(--hh-text-muted)",  label: "Disabled" },
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<AdminCoachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [rejectingRow, setRejectingRow] = useState<AdminCoachRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadCoaches = async () => {
    try {
      setLoading(true);

      const [coachesRes, pendingRes] = await Promise.all([
        coachService.getAll(),
        coachService.getPending(),
      ]);

      const coachRows: AdminCoachRow[] = (coachesRes.coaches ?? []).map((c) => ({
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        email: c.email,
        specialization: c.specialization ?? "",
        status: c.status,
        created_at: c.created_at,
        recordType: "coach",
      }));

      const coachUserIds = new Set(coachRows.map((c) => c.user_id));

      const pendingRows: AdminCoachRow[] = (pendingRes.pending_coaches ?? [])
        .filter((r) => !coachUserIds.has(r.user_id))
        .map((r) => ({
          id: r.coach_id,
          user_id: r.user_id,
          name: r.name,
          email: r.email,
          specialization: r.specialization ?? "",
          status: "pending",
          created_at: r.created_at,
          recordType: "registration",
        }));

      setCoaches([...pendingRows, ...coachRows]);
    } catch {
      setError("Failed to load coaches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoaches();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = (row: AdminCoachRow) => {
    setRejectingRow(row);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectingRow) return;
    const row = rejectingRow;
    const reason = rejectReason.trim() || undefined;
    setRejectingRow(null);
    setActionLoading(row.id);
    try {
      if (row.recordType === "registration") {
        await coachService.processRegistration(row.id, "rejected", reason);
      } else {
        await coachService.updateStatus(row.id, "rejected", reason);
      }
      showToast("Coach rejected successfully", "success");
      void loadCoaches();
    } catch {
      showToast("Failed to reject coach", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (row: AdminCoachRow) => {
    setActionLoading(row.id);
    try {
      if (row.recordType === "registration") {
        await coachService.processRegistration(row.id, "approved");
      } else {
        await coachService.updateStatus(row.id, "approved");
      }
      showToast("Coach approved successfully", "success");
      void loadCoaches();
    } catch {
      showToast("Failed to approve coach", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = coaches.filter((c) => {
    const matchesSearch = `${c.name} ${c.email} ${c.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const counts = {
    all: coaches.length,
    pending: coaches.filter((c) => c.status === "pending").length,
    active: coaches.filter((c) => c.status === "active" || c.status === "approved").length,
    rejected: coaches.filter((c) => c.status === "rejected").length,
  };

  return (
    <>
      <div className="hh-dash-root">
        {toast && (
          <div
            style={{
              position: "fixed", top: 20, right: 20,
              padding: "12px 20px", borderRadius: 8,
              backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)",
              color: "white", fontFamily: "var(--hh-font-body)", fontSize: 14,
              fontWeight: 500, zIndex: 1000, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {toast.message}
          </div>
        )}

        <aside className="hh-sidebar">
          <div className="hh-sidebar__header">
            <a href="/" className="hh-logo">
              <div className="hh-logo__icon hh-logo__icon--md">
                <Dumbbell size={16} color="white" />
              </div>
              <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
            </a>
            <span className="hh-badge hh-badge--sm">Admin Portal</span>
          </div>
          <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />
          <div className="hh-sidebar__footer">
            <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
              Sign Out
            </SignOutButton>
            <a href="/" className="hh-sidebar__back">← Back to Home</a>
          </div>
        </aside>

        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div>
              <h1 className="hh-page-title">COACHES</h1>
              <p className="hh-page-subtitle">Review applications and manage coach accounts</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Total",    value: counts.all,      color: "var(--hh-text-primary)" },
                { label: "Pending",  value: counts.pending,  color: "var(--hh-warning)" },
                { label: "Active",   value: counts.active,   color: "var(--hh-text-green)" },
                { label: "Rejected", value: counts.rejected, color: "var(--hh-error)" },
              ].map((stat) => (
                <div key={stat.label} className="hh-card" style={{ padding: "20px", textAlign: "center" }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
                  <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>{stat.label}</p>
                </div>
              ))}
            </div>

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
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              {loading && <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading coaches...</p>}
              {error && <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>}
              {!loading && !error && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--hh-border)" }}>
                      {["Name", "Email", "Specialization", "Status", "Joined", "Actions"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "12px 16px", textAlign: "left",
                            fontFamily: "var(--hh-font-body)", fontSize: 12,
                            fontWeight: 600, color: "var(--hh-text-muted)",
                            textTransform: "uppercase", letterSpacing: "0.05em",
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
                        <td colSpan={6} style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>
                          No coaches found.
                        </td>
                      </tr>
                    )}
                    {filtered.map((c) => {
                      const statusStyle = STATUS_STYLES[c.status] ?? {
                        bg: "transparent", color: "var(--hh-text-muted)", label: c.status,
                      };
                      const isRowLoading = actionLoading === c.id;

                      return (
                        <tr key={`${c.recordType}-${c.id}`} style={{ borderBottom: "1px solid var(--hh-border)" }}>
                          <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-primary)" }}>
                            {c.name}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                            {c.email}
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 14, textTransform: "capitalize" }}>
                            {c.specialization || "—"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{
                              display: "inline-block", padding: "4px 10px", borderRadius: 12,
                              fontSize: 12, fontWeight: 600,
                              backgroundColor: statusStyle.bg, color: statusStyle.color,
                            }}>
                              {statusStyle.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              {c.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => void handleApprove(c)}
                                    disabled={isRowLoading}
                                    style={{
                                      padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                      border: "none", borderRadius: 6,
                                      cursor: isRowLoading ? "not-allowed" : "pointer",
                                      backgroundColor: "var(--hh-text-green)", color: "white",
                                      opacity: isRowLoading ? 0.6 : 1,
                                    }}
                                  >
                                    {isRowLoading ? "..." : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleReject(c)}
                                    disabled={isRowLoading}
                                    style={{
                                      padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                      border: "none", borderRadius: 6,
                                      cursor: isRowLoading ? "not-allowed" : "pointer",
                                      backgroundColor: "var(--hh-error)", color: "white",
                                      opacity: isRowLoading ? 0.6 : 1,
                                    }}
                                  >
                                    {isRowLoading ? "..." : "Reject"}
                                  </button>
                                </>
                              )}
                              {(c.status === "active" || c.status === "approved") && (
                                <button
                                  onClick={() => handleReject(c)}
                                  disabled={isRowLoading}
                                  style={{
                                    padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                    border: "1px solid var(--hh-error)", borderRadius: 6,
                                    cursor: isRowLoading ? "not-allowed" : "pointer",
                                    backgroundColor: "transparent", color: "var(--hh-error)",
                                    opacity: isRowLoading ? 0.6 : 1,
                                  }}
                                >
                                  {isRowLoading ? "..." : "Disable"}
                                </button>
                              )}
                              {(c.status === "rejected" || c.status === "suspended" || c.status === "disabled") && (
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

      {rejectingRow && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setRejectingRow(null)}
        >
          <div
            className="hh-card"
            style={{ width: 440, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, color: "var(--hh-text-primary)", fontSize: 16, fontWeight: 600 }}>
              Reject — {rejectingRow.name}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-muted)" }}>
              State a reason for rejection. This will be sent to the applicant as a notification.
            </p>
            <div className="hh-field">
              <label className="hh-field__label">Reason</label>
              <textarea
                className="hh-input"
                rows={4}
                placeholder="e.g. Incomplete certifications, insufficient experience..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ resize: "vertical", minHeight: 96, paddingTop: 10 }}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setRejectingRow(null)}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 500,
                  border: "1px solid var(--hh-border)", borderRadius: 6,
                  backgroundColor: "transparent", color: "var(--hh-text-muted)", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmReject()}
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: 600,
                  border: "none", borderRadius: 6,
                  backgroundColor: "var(--hh-error)", color: "white", cursor: "pointer",
                }}
              >
                Confirm rejection
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
