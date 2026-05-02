"use client";

import { useEffect, useRef, useState } from "react";
import { Dumbbell, Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { chatService, ChatMessage, Conversation } from "@/services/chatService";
import { clientRequestService } from "@/services/ClientRequest";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface ConversationWithName extends Conversation {
  client_name: string;
}

export default function CoachChat() {
  const { user } = useAuthStore();
  const coachUserId = user?.id ?? user?.user_id;

  const [conversations, setConversations] = useState<ConversationWithName[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!coachUserId) return;

    const loadConversations = async () => {
      try {
        const [convoRes, requestsRes] = await Promise.all([
          chatService.getConversations(),
          clientRequestService.getAll(Number(coachUserId)),
        ]);

        const nameMap = new Map<number, string>();
        for (const req of requestsRes.requests ?? []) {
          if (req.status === "accepted") {
            nameMap.set(req.client_id, req.client_name ?? `Client #${req.client_id}`);
          }
        }

        const enriched: ConversationWithName[] = (convoRes.Conversations ?? []).map((c) => ({
          ...c,
          client_name: nameMap.get(c.user_id) ?? `Client #${c.user_id}`,
        }));

        setConversations(enriched);

        if (enriched.length > 0) {
          await selectConversation(enriched[0]);
        }
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };

    void loadConversations();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [coachUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = async (convo: ConversationWithName) => {
    setSelectedConvoId(convo.MessageList_id);

    const msgs = await chatService.getMessages(convo.MessageList_id);
    setMessages(msgs);

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.emit("join", { conversation_id: convo.MessageList_id });
    socket.on("new_message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });
  };

  const handleSelect = async (convo: ConversationWithName) => {
    await selectConversation(convo);
  };

  const handleSend = () => {
    if (!input.trim() || selectedConvoId === null || !coachUserId || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      conversation_id: selectedConvoId,
      sender_id: Number(coachUserId),
      content: input.trim(),
    });

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const selectedConvo = conversations.find((c) => c.MessageList_id === selectedConvoId);

  return (
    <div className="hh-dash-root">
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
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">CHAT</h1>
            <p className="hh-page-subtitle">Messages with your clients</p>
          </div>

          {loading ? (
            <div className="hh-card">
              <p style={{ color: "var(--hh-text-muted)" }}>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="hh-card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ color: "var(--hh-text-muted)" }}>
                No conversations yet. Clients can message you once they connect with you.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--hh-sp-24)", height: 600 }}>
              {/* Conversation list */}
              <div className="hh-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 16px 12px", borderBottom: "0.6px solid var(--hh-border)" }}>
                  <h3 className="hh-panel-heading" style={{ marginBottom: 0 }}>Clients</h3>
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {conversations.map((c) => (
                    <div
                      key={c.MessageList_id}
                      onClick={() => void handleSelect(c)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 16px", cursor: "pointer",
                        background: selectedConvoId === c.MessageList_id ? "var(--hh-accent-15)" : "transparent",
                        borderLeft: selectedConvoId === c.MessageList_id ? "2px solid var(--hh-accent)" : "2px solid transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedConvoId !== c.MessageList_id) e.currentTarget.style.background = "var(--hh-bg-card-dark)";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedConvoId !== c.MessageList_id) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--hh-accent-20)", display: "flex", alignItems: "center",
                        justifyContent: "center", flexShrink: 0,
                        fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-16)",
                        fontWeight: 700, color: "var(--hh-accent-light)",
                      }}>
                        {c.client_name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 600, color: "var(--hh-text-primary)" }}>
                          {c.client_name}
                        </div>
                        <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>
                          {c.last_message_at
                            ? new Date(c.last_message_at).toLocaleDateString()
                            : "No messages yet"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message area */}
              <div className="hh-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {selectedConvo ? (
                  <>
                    <div style={{ padding: "14px 20px", borderBottom: "0.6px solid var(--hh-border)", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--hh-accent-20)", display: "flex", alignItems: "center",
                        justifyContent: "center", fontFamily: "var(--hh-font-display)",
                        fontSize: "var(--hh-fs-16)", fontWeight: 700, color: "var(--hh-accent-light)", flexShrink: 0,
                      }}>
                        {selectedConvo.client_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 600, color: "var(--hh-text-primary)" }}>
                          {selectedConvo.client_name}
                        </div>
                        <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Client</div>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {messages.length === 0 && (
                        <p style={{ color: "var(--hh-text-muted)", textAlign: "center", marginTop: 32 }}>
                          No messages yet. Start the conversation!
                        </p>
                      )}
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === Number(coachUserId);
                        return (
                          <div key={msg.message_id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "70%" }}>
                              <div style={{
                                padding: "10px 14px",
                                borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                background: isMe ? "var(--hh-accent)" : "var(--hh-bg-card-dark)",
                                fontSize: "var(--hh-fs-14)", color: "var(--hh-text-primary)", lineHeight: 1.5,
                              }}>
                                {msg.content}
                              </div>
                              <div style={{ fontSize: "var(--hh-fs-11)", color: "var(--hh-text-muted)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={bottomRef} />
                    </div>

                    <div style={{ padding: "12px 16px", borderTop: "0.6px solid var(--hh-border)", display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        style={{ flex: 1 }}
                      />
                      <button onClick={handleSend} className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
                    <p style={{ color: "var(--hh-text-muted)" }}>Select a client to view messages</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
