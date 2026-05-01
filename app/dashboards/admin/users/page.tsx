"use client";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { userService } from "@/services/userService";
import { UserItem } from "@/types/UserItem";
import { useEffect, useState } from "react";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON =
"";
const NAV_DASHBOARD =
  "";
const NAV_USERS =
  "";
const NAV_COACHES =
  "";
const NAV_EXERCISE =
  "";
const NAV_PAYMENT =
  "";
const NAV_NOTIF =
  "";

 

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

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      loadUsers();
      console.log(users);
       
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
              <img src={LOGO_ICON} alt="" width={16} height={16} />
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
                    {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
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
                        colSpan={5}
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
                      key={u.id}
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
