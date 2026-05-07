"use client";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { userService } from "@/services/userService";
import { UserItem } from "@/types/UserItem";
import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  admin: "hh-badge hh-badge--admin",
  coach: "hh-badge hh-badge--coach",
  client: "hh-badge hh-badge--client",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers((data as any).users ?? []);
    } catch (error) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const resolveId = (u: UserItem) => u.user_id ?? u.id;

  const toggleStatus = async (u: UserItem) => {
    const uid = resolveId(u);
    setTogglingId(uid);
    try {
      await userService.updateStatus(uid, !u.is_active);
      setUsers((prev) => prev.map((x) => resolveId(x) === uid ? { ...x, is_active: !u.is_active } : x));
    } catch {
      // no-op — keep existing state
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter((u) =>
    `${u.first_name} ${u.last_name} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="hh-dash-root">
      {/* ── SIDEBAR ── */}
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
          <a href="/" className="hh-sidebar__back">
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          {/* Heading */}
          <div>
            <h1 className="hh-page-title">USERS</h1>
            <p className="hh-page-subtitle">Manage all platform users</p>
          </div>

          {/* Search */}
          <div className="hh-card">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hh-input"
              style={{ maxWidth: 360 }}
            />
          </div>

          {/* Table */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>
                Loading users...
              </p>
            )}
            {error && (
              <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>
            )}
            {!loading && !error && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hh-border)" }}>
                    {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 20px",
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
                        style={{
                          padding: 24,
                          color: "var(--hh-text-muted)",
                          textAlign: "center",
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((u) => (
                    <tr
                      key={resolveId(u)}
                      style={{ borderBottom: "1px solid var(--hh-border)" }}
                    >
                      <td
                        style={{
                          padding: "14px 20px",
                          fontFamily: "var(--hh-font-body)",
                          fontSize: 14,
                          color: "var(--hh-text-primary)",
                        }}
                      >
                        {u.first_name} {u.last_name}
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontFamily: "var(--hh-font-body)",
                          fontSize: 14,
                          color: "var(--hh-text-muted)",
                        }}
                      >
                        {u.email}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={ROLE_COLORS[u.role] ?? "hh-badge"}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontFamily: "var(--hh-font-body)",
                            color: u.is_active
                              ? "var(--hh-text-green)"
                              : "var(--hh-error)",
                            fontWeight: 600,
                          }}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 20px",
                          fontFamily: "var(--hh-font-body)",
                          fontSize: 14,
                          color: "var(--hh-text-muted)",
                        }}
                      >
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          onClick={() => toggleStatus(u)}
                          disabled={togglingId === resolveId(u)}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 12px",
                            borderRadius: 6,
                            border: "1px solid",
                            cursor: togglingId === resolveId(u) ? "not-allowed" : "pointer",
                            background: "transparent",
                            borderColor: u.is_active ? "var(--hh-error)" : "var(--hh-text-green)",
                            color: u.is_active ? "var(--hh-error)" : "var(--hh-text-green)",
                            opacity: togglingId === resolveId(u) ? 0.5 : 1,
                          }}
                        >
                          {togglingId === resolveId(u) ? "..." : u.is_active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
