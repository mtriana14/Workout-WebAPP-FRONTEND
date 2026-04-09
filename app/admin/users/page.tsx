"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, UserCheck, Users } from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";
import {
  fetchAdminUsers,
  getStoredAuthToken,
  updateAdminUserStatus,
  type AdminUserRecord,
  type AdminUsersResponse,
} from "@/app/lib/api";

type RoleFilter = "all" | "client" | "coach" | "admin";

const ROLE_FILTERS: RoleFilter[] = ["all", "client", "coach", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [counts, setCounts] = useState<AdminUsersResponse["counts"] | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async (nextRole = roleFilter) => {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before loading users.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const data = await fetchAdminUsers(token, nextRole);
      setUsers(data.users);
      setCounts(data.counts);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    void loadUsers(roleFilter);
  }, [loadUsers, roleFilter]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, users]);

  async function handleToggleUser(user: AdminUserRecord) {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before updating users.");
      return;
    }

    try {
      setStatus("");
      setError("");
      const response = await updateAdminUserStatus(token, user.user_id, !user.is_active);
      setUsers((current) =>
        current.map((currentUser) =>
          currentUser.user_id === user.user_id ? response.user : currentUser,
        ),
      );
      setStatus(response.message);
      void loadUsers(roleFilter);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update user.");
    }
  }

  return (
    <AdminPortalShell
      activePage="users"
      title="USERS"
      subtitle="Search, filter, and activate or disable platform accounts."
    >
      <div className="hh-stats-grid">
        {[
          { label: "Total Users", value: counts?.total ?? users.length, icon: Users },
          { label: "Active Users", value: counts?.active ?? users.filter((user) => user.is_active).length, icon: UserCheck },
          { label: "Coaches", value: counts?.coaches ?? users.filter((user) => user.role === "coach").length, icon: ShieldCheck },
          { label: "Admins", value: counts?.admins ?? users.filter((user) => user.role === "admin").length, icon: ShieldCheck },
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
              placeholder="Search by name, email, or role"
            />
          </div>

          <div className="hh-portal-chip-row">
            {ROLE_FILTERS.map((role) => (
              <button
                key={role}
                type="button"
                className={`hh-portal-day-toggle${roleFilter === role ? " hh-portal-day-toggle--active" : ""}`}
                onClick={() => setRoleFilter(role)}
              >
                {role === "all" ? "All" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="hh-error-msg">{error}</p> : null}
      {status ? <p className="hh-portal-status">{status}</p> : null}

      <div className="hh-card">
        <h2 className="hh-panel-heading">User Directory</h2>
        {isLoading ? (
          <p className="hh-portal-card-copy">Loading users from the database...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="hh-portal-card-copy">No users match the current filters.</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 1.4fr) 1fr 120px 120px",
                  gap: 16,
                  alignItems: "center",
                  padding: "14px 0",
                  borderTop: "1px solid var(--hh-border)",
                }}
              >
                <div>
                  <p className="hh-portal-summary-value">{user.name}</p>
                  <p className="hh-portal-card-copy">{user.email}</p>
                </div>
                <span className="hh-portal-pill">{user.role}</span>
                <span className="hh-portal-pill">{user.is_active ? "Active" : "Disabled"}</span>
                <button
                  type="button"
                  className="hh-portal-button hh-portal-button--secondary"
                  onClick={() => void handleToggleUser(user)}
                  disabled={user.role === "admin"}
                >
                  {user.is_active ? "Disable" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminPortalShell>
  );
}
