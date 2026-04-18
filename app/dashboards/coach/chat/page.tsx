"use client";

import { useState, useRef, useEffect } from "react";
import { Dumbbell, Send } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";

type Message = { from: "coach" | "client"; text: string; time: string };

type Client = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
};

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Alex Morgan",
    lastMessage: "Thanks coach! See you tomorrow.",
    time: "2h ago",
    unread: 0,
    messages: [
      {
        from: "client",
        text: "Hey coach, I finished the push day workout!",
        time: "10:00 AM",
      },
      {
        from: "coach",
        text: "Great work Alex! How did the bench press feel?",
        time: "10:05 AM",
      },
      {
        from: "client",
        text: "Felt strong, hit 185 for all 4 sets.",
        time: "10:08 AM",
      },
      {
        from: "coach",
        text: "Perfect, we'll bump it to 190 next week.",
        time: "10:10 AM",
      },
      {
        from: "client",
        text: "Thanks coach! See you tomorrow.",
        time: "10:12 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Sam Chen",
    lastMessage: "Can we reschedule Friday?",
    time: "3h ago",
    unread: 2,
    messages: [
      {
        from: "client",
        text: "Hey, quick question about my meal plan.",
        time: "9:00 AM",
      },
      { from: "coach", text: "Sure, what's up?", time: "9:15 AM" },
      { from: "client", text: "Can we reschedule Friday?", time: "9:20 AM" },
    ],
  },
  {
    id: "3",
    name: "Taylor Kim",
    lastMessage: "Just logged 10k steps!",
    time: "5h ago",
    unread: 1,
    messages: [
      { from: "client", text: "Just logged 10k steps!", time: "8:00 AM" },
    ],
  },
  {
    id: "4",
    name: "Morgan Davis",
    lastMessage: "PR'd bench press today 🎉",
    time: "1d ago",
    unread: 0,
    messages: [
      { from: "client", text: "PR'd bench press today 🎉", time: "Yesterday" },
      {
        from: "coach",
        text: "Let's gooo! That's what I'm talking about!",
        time: "Yesterday",
      },
    ],
  },
];

export default function CoachChat() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find((c) => c.id === selectedId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, clients]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // clear unread when opening
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: input,
              time: "Just now",
              messages: [
                ...c.messages,
                { from: "coach", text: input, time: now },
              ],
            }
          : c,
      ),
    );
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="hh-dash-root">
      {/* SIDEBAR */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
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

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          {/* Header */}
          <div>
            <h1 className="hh-page-title">CHAT</h1>
            <p className="hh-page-subtitle">Messages with your clients</p>
          </div>

          {/* Chat layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: "var(--hh-sp-24)",
              height: 600,
            }}
          >
            {/* Client list */}
            <div
              className="hh-card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  padding: "16px 16px 12px",
                  borderBottom: "0.6px solid var(--hh-border)",
                }}
              >
                <h3 className="hh-panel-heading" style={{ marginBottom: 0 }}>
                  Clients
                </h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background:
                        selectedId === c.id
                          ? "var(--hh-accent-15)"
                          : "transparent",
                      borderLeft:
                        selectedId === c.id
                          ? "2px solid var(--hh-accent)"
                          : "2px solid transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedId !== c.id)
                        e.currentTarget.style.background =
                          "var(--hh-bg-card-dark)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedId !== c.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--hh-accent-20)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontFamily: "var(--hh-font-display)",
                        fontSize: "var(--hh-fs-16)",
                        fontWeight: 700,
                        color: "var(--hh-accent-light)",
                      }}
                    >
                      {c.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--hh-fs-14)",
                            fontWeight: 600,
                            color: "var(--hh-text-primary)",
                          }}
                        >
                          {c.name}
                        </span>
                        <span
                          style={{
                            fontSize: "var(--hh-fs-11)",
                            color: "var(--hh-text-muted)",
                          }}
                        >
                          {c.time}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "var(--hh-fs-12)",
                            color: "var(--hh-text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 140,
                          }}
                        >
                          {c.lastMessage}
                        </span>
                        {c.unread > 0 && (
                          <span
                            style={{
                              background: "var(--hh-accent)",
                              color: "white",
                              borderRadius: 9999,
                              fontSize: "var(--hh-fs-10)",
                              fontWeight: 700,
                              padding: "1px 6px",
                              flexShrink: 0,
                            }}
                          >
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message area */}
            <div
              className="hh-card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Chat header */}
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "0.6px solid var(--hh-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--hh-accent-20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--hh-font-display)",
                    fontSize: "var(--hh-fs-16)",
                    fontWeight: 700,
                    color: "var(--hh-accent-light)",
                    flexShrink: 0,
                  }}
                >
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "var(--hh-fs-14)",
                      fontWeight: 600,
                      color: "var(--hh-text-primary)",
                    }}
                  >
                    {selectedClient.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--hh-fs-12)",
                      color: "var(--hh-text-muted)",
                    }}
                  >
                    Client
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {selectedClient.messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent:
                        msg.from === "coach" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ maxWidth: "70%" }}>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius:
                            msg.from === "coach"
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                          background:
                            msg.from === "coach"
                              ? "var(--hh-accent)"
                              : "var(--hh-bg-card-dark)",
                          fontSize: "var(--hh-fs-14)",
                          color: "var(--hh-text-primary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.text}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--hh-fs-11)",
                          color: "var(--hh-text-muted)",
                          marginTop: 4,
                          textAlign: msg.from === "coach" ? "right" : "left",
                        }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "0.6px solid var(--hh-border)",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleSend}
                  className="btn btn--primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
