"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Send, Trash2 } from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";
import {
  deleteAdminNotification,
  fetchAdminNotifications,
  fetchAdminUsers,
  getStoredAuthToken,
  sendAdminNotification,
  type AdminNotificationRecord,
  type AdminUserRecord,
} from "@/app/lib/api";

const NOTIFICATION_TYPES = [
  "system",
  "payment",
  "coach_request",
  "request_accepted",
  "request_declined",
  "new_workout",
  "new_meal_plan",
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [draft, setDraft] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "system",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  async function loadNotifications() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before loading notifications.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const [notificationResponse, userResponse] = await Promise.all([
        fetchAdminNotifications(token),
        fetchAdminUsers(token),
      ]);
      setNotifications(notificationResponse.notifications);
      setUsers(userResponse.users);
      setDraft((current) => ({
        ...current,
        user_id: current.user_id || userResponse.users[0]?.user_id.toString() || "",
      }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications],
  );

  async function handleSend() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before sending notifications.");
      return;
    }

    if (!draft.user_id || !draft.title.trim() || !draft.message.trim()) {
      setError("Choose a recipient and enter a title and message.");
      return;
    }

    try {
      setError("");
      setStatus("");
      setIsSending(true);
      const response = await sendAdminNotification(token, {
        user_id: Number(draft.user_id),
        title: draft.title.trim(),
        message: draft.message.trim(),
        type: draft.type,
      });
      setStatus(response.message);
      setDraft((current) => ({ ...current, title: "", message: "" }));
      await loadNotifications();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to send notification.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete(notification: AdminNotificationRecord) {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before deleting notifications.");
      return;
    }

    if (!window.confirm(`Delete "${notification.title}"?`)) {
      return;
    }

    try {
      setError("");
      setStatus("");
      const response = await deleteAdminNotification(token, notification.notification_id);
      setStatus(response.message);
      await loadNotifications();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete notification.");
    }
  }

  return (
    <AdminPortalShell
      activePage="notifications"
      title="NOTIFICATIONS"
      subtitle="Send platform messages and review notification history."
    >
      <div className="hh-stats-grid">
        {[
          { label: "Total Notifications", value: notifications.length },
          { label: "Unread", value: unreadCount },
          { label: "Recipients", value: new Set(notifications.map((notification) => notification.user_id)).size },
          { label: "System Alerts", value: notifications.filter((notification) => notification.type === "system").length },
        ].map((card) => (
          <div key={card.label} className="hh-card">
            <div className="hh-card__header">
              <span className="hh-card__label">{card.label}</span>
              <div className="hh-card__icon">
                <Bell size={16} color="var(--hh-text-muted)" />
              </div>
            </div>
            <p className="hh-card__value">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="hh-error-msg">{error}</p> : null}
      {status ? <p className="hh-portal-status">{status}</p> : null}

      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 1 }}>
          <h2 className="hh-panel-heading">Send Notification</h2>
          <div className="hh-portal-form-grid">
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Recipient</span>
              <select
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.user_id}
                onChange={(event) => setDraft((current) => ({ ...current, user_id: event.target.value }))}
              >
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </label>
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Type</span>
              <select
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.type}
                onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
              >
                {NOTIFICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Title</span>
              <input
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="hh-field hh-portal-field--full">
              <span className="hh-field__label">Message</span>
              <textarea
                className="hh-portal-textarea"
                value={draft.message}
                onChange={(event) => setDraft((current) => ({ ...current, message: event.target.value }))}
              />
            </label>
          </div>
          <button
            type="button"
            className="hh-portal-button hh-portal-button--primary"
            style={{ marginTop: 16 }}
            onClick={() => void handleSend()}
            disabled={isSending || users.length === 0}
          >
            <Send size={14} /> {isSending ? "Sending..." : "Send Notification"}
          </button>
        </section>

        <section className="hh-card" style={{ flex: 1.4 }}>
          <h2 className="hh-panel-heading">Notification History</h2>
          {isLoading ? (
            <p className="hh-portal-card-copy">Loading notifications from the database...</p>
          ) : notifications.length === 0 ? (
            <p className="hh-portal-card-copy">No notifications have been sent yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {notifications.map((notification) => (
                <div key={notification.notification_id} style={{ padding: "14px 0", borderTop: "1px solid var(--hh-border)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div className="hh-portal-chip-row" style={{ marginBottom: 8 }}>
                        <span className="hh-portal-pill">{notification.type}</span>
                        <span className="hh-portal-pill">{notification.is_read ? "Read" : "Unread"}</span>
                      </div>
                      <p className="hh-portal-summary-value">{notification.title}</p>
                      <p className="hh-portal-card-copy">{notification.message}</p>
                      <p className="hh-portal-card-copy">
                        To {notification.user_name} · {notification.user_email || "No email"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="hh-portal-button hh-portal-button--ghost"
                      onClick={() => void handleDelete(notification)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPortalShell>
  );
}
