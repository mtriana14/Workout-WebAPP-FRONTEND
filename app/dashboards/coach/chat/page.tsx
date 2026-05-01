"use client";
import { useState, useEffect, useRef } from "react";
import { Dumbbell, Send } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";

interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Client {
  conversation_id: number;
  user_id: number;
  name: string;
  last_message: string;
  last_time: string | null;
  unread_count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem("auth") || "";
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || "";
  } catch {
    return "";
  }
}

function getCurrentUserId(): number {
  if (typeof window === "undefined") return 0;
  const token = getToken();
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return parseInt(payload.sub);
  } catch {
    return 0;
  }
}

export default function CoachChat() {
  const [clients, setClients]         = useState<Client[]>([]);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserId = getCurrentUserId();

  // Cargar lista de conversaciones
  useEffect(() => {
    fetchConversations();
  }, []);

  // Cargar mensajes cuando se selecciona un cliente + polling
  useEffect(() => {
    if (!selectedId) return;
    fetchMessages(selectedId);
    const interval = setInterval(() => fetchMessages(selectedId), 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Scroll al fondo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch(`${API_BASE}/chat/coach/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();

      // Obtener nombres de cada cliente
      const withNames = await Promise.all(
        data.map(async (c: any) => {
          try {
            const nameRes = await fetch(`${API_BASE}/users/${c.user_id}/name`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            });
            const nameData = nameRes.ok ? await nameRes.json() : { full_name: "Client" };
            return { ...c, name: nameData.full_name };
          } catch {
            return { ...c, name: "Client" };
          }
        })
      );

      setClients(withNames);
      if (withNames.length > 0) setSelectedId(withNames[0].conversation_id);
    } catch {
      console.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId: number) {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`${API_BASE}/chat/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);

      // Marcar como leído en la lista
      setClients(prev =>
        prev.map(c => c.conversation_id === conversationId ? { ...c, unread_count: 0 } : c)
      );
    } catch {
      console.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || !selectedId) return;
    const content = input.trim();
    setInput("");

    try {
      const res = await fetch(`${API_BASE}/chat/${selectedId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);

      // Actualizar último mensaje en la lista
      setClients(prev =>
        prev.map(c => c.conversation_id === selectedId ? { ...c, last_message: content, last_time: new Date().toISOString() } : c)
      );
    } catch {
      console.error("Failed to send message");
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const selectedClient = clients.find(c => c.conversation_id === selectedId);

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

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "var(--hh-sp-24)", height: 600 }}>

            {/* Lista de clientes */}
            <div className="hh-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 16px 12px", borderBottom: "0.6px solid var(--hh-border)" }}>
                <h3 className="hh-panel-heading" style={{ marginBottom: 0 }}>Clients</h3>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {loading && <p style={{ padding: 16, color: "#aaa", fontSize: 13 }}>Loading...</p>}
                {!loading && clients.length === 0 && (
                  <p style={{ padding: 16, color: "#aaa", fontSize: 13 }}>No conversations yet.</p>
                )}
                {clients.map((c) => (
                  <div
                    key={c.conversation_id}
                    onClick={() => setSelectedId(c.conversation_id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer",
                      background: selectedId === c.conversation_id ? "var(--hh-accent-15)" : "transparent",
                      borderLeft: selectedId === c.conversation_id ? "2px solid var(--hh-accent)" : "2px solid transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--hh-accent-20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--hh-font-display)", fontSize: 16, fontWeight: 700, color: "var(--hh-accent-light)" }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>{c.name}</span>
                        {c.last_time && (
                          <span style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>
                            {new Date(c.last_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--hh-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                          {c.last_message || "No messages yet"}
                        </span>
                        {c.unread_count > 0 && (
                          <span style={{ background: "var(--hh-accent)", color: "white", borderRadius: 9999, fontSize: 10, fontWeight: 700, padding: "1px 6px", flexShrink: 0 }}>
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Área de mensajes */}
            <div className="hh-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {!selectedClient ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                  Select a client to start chatting
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{ padding: "14px 20px", borderBottom: "0.6px solid var(--hh-border)", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--hh-accent-20)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--hh-accent-light)", fontSize: 15, flexShrink: 0 }}>
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>{selectedClient.name}</div>
                      <div style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>Client</div>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                    {loadingMsgs && <p style={{ color: "#aaa", textAlign: "center" }}>Loading...</p>}
                    {!loadingMsgs && messages.length === 0 && (
                      <p style={{ color: "#aaa", textAlign: "center", marginTop: 32 }}>No messages yet.</p>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <div key={msg.message_id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                          <div style={{ maxWidth: "70%" }}>
                            <div style={{ padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isMe ? "var(--hh-accent)" : "var(--hh-bg-card-dark)", fontSize: 14, color: "var(--hh-text-primary)", lineHeight: 1.5 }}>
                              {msg.content}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--hh-text-muted)", marginTop: 4, textAlign: isMe ? "right" : "left" }}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
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
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}