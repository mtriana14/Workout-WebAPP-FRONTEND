"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Check } from "lucide-react";
import {
  fetchUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getStoredAuthSession,
  type UserNotificationRecord,
} from "@/app/lib/api";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { SignOutButton } from "@/app/components/signOutButton";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<UserNotificationRecord[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const session = getStoredAuthSession();
  const token = session?.token ?? null;
  const userId = session?.user?.id ?? session?.user?.userId ?? null;

  async function loadNotifications() {
    if (!token || !userId) {
      setError("Not authenticated.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError("");
      const res = await fetchUserNotifications(token, userId);
      setNotifications(res.notifications);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function handleMarkRead(notification: UserNotificationRecord) {
    if (!token) return;
    try {
      await markNotificationRead(token, notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read.");
    }
  }

  async function handleMarkAllRead() {
    if (!token || !userId) return;
    try {
      await markAllNotificationsRead(token, userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setStatus("All notifications marked as read.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to mark all as read.",
      );
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="hh-dash-root">
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md" />
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">
            ← Back to Home
          </a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Bell size={22} />
              <h1 className="hh-page-title" style={{ margin: 0 }}>
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="hh-badge">{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="hh-portal-button hh-portal-button--ghost"
                onClick={() => void handleMarkAllRead()}
              >
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          {error && <p className="hh-error-msg">{error}</p>}
          {status && <p className="hh-portal-status">{status}</p>}

          {isLoading ? (
            <p className="hh-portal-card-copy">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div
              className="hh-card"
              style={{ textAlign: "center", padding: 40 }}
            >
              <Bell
                size={32}
                color="var(--hh-text-muted)"
                style={{ margin: "0 auto 12px" }}
              />
              <p className="hh-portal-card-copy">No notifications yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="hh-card"
                  style={{
                    borderLeft: n.is_read
                      ? undefined
                      : "3px solid var(--hh-accent)",
                    opacity: n.is_read ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        className="hh-portal-chip-row"
                        style={{ marginBottom: 6 }}
                      >
                        <span className="hh-portal-pill">{n.type}</span>
                        {!n.is_read && (
                          <span className="hh-portal-pill">New</span>
                        )}
                      </div>
                      <p className="hh-portal-summary-value">{n.title}</p>
                      <p className="hh-portal-card-copy">{n.message}</p>
                      {n.created_at && (
                        <p
                          className="hh-portal-card-copy"
                          style={{ fontSize: 11, marginTop: 4 }}
                        >
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {!n.is_read && (
                      <button
                        type="button"
                        className="hh-portal-button hh-portal-button--ghost"
                        onClick={() => void handleMarkRead(n)}
                      >
                        <Check size={14} /> Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
