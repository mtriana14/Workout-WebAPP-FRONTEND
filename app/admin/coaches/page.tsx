"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BadgeCheck, Briefcase, Search, UserX } from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";
import {
  disableAdminCoach,
  fetchAdminCoaches,
  getStoredAuthToken,
  processAdminCoach,
  reactivateAdminCoach,
  suspendAdminCoach,
  type AdminCoachRecord,
} from "@/app/lib/api";

type CoachFilter = "all" | "pending" | "approved" | "suspended" | "disabled" | "rejected";

const COACH_FILTERS: CoachFilter[] = ["all", "pending", "approved", "suspended", "disabled", "rejected"];

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<AdminCoachRecord[]>([]);
  const [filter, setFilter] = useState<CoachFilter>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingCoach, setRejectingCoach] = useState<AdminCoachRecord | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadCoaches() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before loading coaches.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const allResponse = await fetchAdminCoaches(token);
      setCoaches(allResponse.coaches);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load coaches.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return coaches.filter((coach) => {
      const matchesFilter = filter === "all" || coach.status === filter;
      const matchesSearch =
        !query ||
        [coach.name, coach.email, coach.specialization, coach.status].some((value) =>
          value.toLowerCase().includes(query),
        );
      return matchesFilter && matchesSearch;
    });
  }, [coaches, filter, search]);

  async function runCoachAction(action: () => Promise<{ message: string }>) {
    try {
      setStatus("");
      setError("");
      const response = await action();
      setStatus(response.message);
      await loadCoaches();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update coach.");
    }
  }

  function withToken(action: (token: string) => Promise<{ message: string }>) {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before updating coaches.");
      return;
    }
    void runCoachAction(() => action(token));
  }

  return (
    <>
    <AdminPortalShell
      activePage="coaches"
      title="COACHES"
      subtitle="Review coach applications and manage coach account status."
    >
      <div className="hh-stats-grid">
        {[
          { label: "Total Coaches", value: coaches.length, icon: Briefcase },
          { label: "Pending Review", value: coaches.filter((coach) => coach.status === "pending").length, icon: BadgeCheck },
          { label: "Approved", value: coaches.filter((coach) => coach.status === "approved").length, icon: BadgeCheck },
          { label: "Suspended", value: coaches.filter((coach) => coach.status === "suspended").length, icon: UserX },
        ].map((card) => (
          <div key={card.label} className="hh-card">
            <div className="hh-card__header">
              <span className="hh-card__label">{card.label}</span>
              <div className="hh-card__icon">
                <card.icon size={16} color="var(--hh-text-muted)" />
              </div>
            </div>
            <p className="hh-card__value">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="hh-card">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div className="hh-input-wrap" style={{ flex: "1 1 280px", margin: 0 }}>
            <Search size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
            <input
              className="hh-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search coach name, email, specialty, or status"
            />
          </div>
          <div className="hh-portal-chip-row">
            {COACH_FILTERS.map((nextFilter) => (
              <button
                key={nextFilter}
                type="button"
                className={`hh-portal-day-toggle${filter === nextFilter ? " hh-portal-day-toggle--active" : ""}`}
                onClick={() => setFilter(nextFilter)}
              >
                {nextFilter === "all" ? "All" : nextFilter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="hh-error-msg">{error}</p> : null}
      {status ? <p className="hh-portal-status">{status}</p> : null}

      <div className="hh-card">
        <h2 className="hh-panel-heading">Coach Roster</h2>
        {isLoading ? (
          <p className="hh-portal-card-copy">Loading coaches from the database...</p>
        ) : filteredCoaches.length === 0 ? (
          <p className="hh-portal-card-copy">No coaches match the current filters.</p>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredCoaches.map((coach) => (
              <div
                key={coach.coach_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(220px, 1.5fr) 1fr minmax(220px, 1fr)",
                  gap: 16,
                  alignItems: "center",
                  padding: "16px 0",
                  borderTop: "1px solid var(--hh-border)",
                }}
              >
                <div>
                  <p className="hh-portal-summary-value">{coach.name}</p>
                  <p className="hh-portal-card-copy">{coach.email}</p>
                  <p className="hh-portal-card-copy">{coach.bio || "No bio on file."}</p>
                </div>
                <div className="hh-portal-summary-list">
                  <span className="hh-portal-pill">{coach.status}</span>
                  <p className="hh-portal-card-copy">
                    {coach.specialization} · {coach.experience_years ?? 0} years · ${coach.cost}/mo
                  </p>
                  <p className="hh-portal-card-copy">{coach.certifications || "No certifications listed."}</p>
                </div>
                <div className="hh-portal-header__actions">
                  {coach.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        className="hh-portal-button hh-portal-button--primary"
                        onClick={() => withToken((token) => processAdminCoach(token, coach.coach_id, "approved"))}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="hh-portal-button hh-portal-button--secondary"
                        onClick={() => { setRejectingCoach(coach); setRejectReason(""); }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                  {coach.status === "suspended" ? (
                    <button
                      type="button"
                      className="hh-portal-button hh-portal-button--primary"
                      onClick={() => withToken((token) => reactivateAdminCoach(token, coach.coach_id))}
                    >
                      Reactivate
                    </button>
                  ) : null}
                  {!["pending", "suspended", "disabled", "rejected"].includes(coach.status) ? (
                    <button
                      type="button"
                      className="hh-portal-button hh-portal-button--secondary"
                      onClick={() => withToken((token) => suspendAdminCoach(token, coach.coach_id))}
                    >
                      Suspend
                    </button>
                  ) : null}
                  {!["disabled", "rejected"].includes(coach.status) ? (
                    <button
                      type="button"
                      className="hh-portal-button hh-portal-button--ghost"
                      onClick={() => {
                        if (window.confirm(`Disable ${coach.name}?`)) {
                          withToken((token) => disableAdminCoach(token, coach.coach_id));
                        }
                      }}
                    >
                      Disable
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPortalShell>

      {rejectingCoach && createPortal(
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setRejectingCoach(null)}
        >
          <div
            className="hh-card"
            style={{ width: 440, maxWidth: "90vw", display: "flex", flexDirection: "column", gap: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, color: "var(--hh-text-primary)", fontSize: 16, fontWeight: 600 }}>
              Reject — {rejectingCoach.name}
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-muted)" }}>
              This reason will be sent to the applicant as a notification.
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
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="hh-portal-button hh-portal-button--ghost"
                onClick={() => setRejectingCoach(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hh-portal-button hh-portal-button--secondary"
                onClick={() => {
                  const coach = rejectingCoach;
                  setRejectingCoach(null);
                  withToken((token) =>
                    processAdminCoach(token, coach.coach_id, "rejected", rejectReason.trim() || undefined)
                  );
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
