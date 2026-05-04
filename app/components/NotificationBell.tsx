"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService, type AppNotification } from "@/services/notificationService";

interface Props {
  userId: number;
}

export function NotificationBell({ userId }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await notificationService.getUnread(userId);
        setUnreadCount(data.unread_count);
      } catch {}
    };
    void fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await notificationService.getAll(userId);
      setNotifications(data.notifications);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (n: AppNotification) => {
    if (n.is_read) return;
    try {
      await notificationService.markRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead(userId);
      setNotifications((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleDelete = async (e: React.MouseEvent, notifId: number) => {
    e.stopPropagation();
    try {
      await notificationService.delete(notifId);
      const removed = notifications.find((n) => n.id === notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      if (removed && !removed.is_read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        style={{
          position: "relative",
          background: "none",
          border: "1px solid var(--hh-border)",
          borderRadius: 8,
          padding: "8px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          color: "var(--hh-text-primary)",
          backgroundColor: isOpen ? "var(--hh-bg-card-dark)" : "transparent",
        }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: "var(--hh-error)",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 360,
            maxHeight: 440,
            backgroundColor: "var(--hh-bg-card)",
            border: "1px solid var(--hh-border)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--hh-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    padding: "2px 7px",
                    borderRadius: 10,
                    backgroundColor: "var(--hh-error)",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  color: "var(--hh-accent)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", fontSize: 14, textAlign: "center" }}>
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", fontSize: 14, textAlign: "center" }}>
                You're all caught up!
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--hh-border)",
                    cursor: n.is_read ? "default" : "pointer",
                    backgroundColor: n.is_read
                      ? "transparent"
                      : "rgba(139, 92, 246, 0.06)",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    transition: "background 0.15s",
                  }}
                >
                  {/* Unread dot */}
                  <div style={{ width: 8, flexShrink: 0, paddingTop: 4 }}>
                    {!n.is_read && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "var(--hh-accent)",
                        }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: n.is_read ? 400 : 600,
                        color: "var(--hh-text-primary)",
                      }}
                    >
                      {n.title}
                    </p>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 12,
                        color: "var(--hh-text-muted)",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {n.message}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--hh-text-muted)" }}>
                      {new Date(n.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--hh-text-muted)",
                      fontSize: 16,
                      lineHeight: 1,
                      padding: "0 2px",
                      flexShrink: 0,
                    }}
                    aria-label="Delete notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
