"use client";
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";

interface Message {
  message_id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  conversation_id: number;
  user_id: number;
  coach_id: number;
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

export default function ChatPage() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [message, setMessage]           = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [coachId, setCoachId]           = useState<number | null>(null);
  const [coachName, setCoachName]       = useState<string>("Coach");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentUserId = getCurrentUserId();

  // Paso 1: obtener coach asignado al cliente
  useEffect(() => {
    async function fetchCoach() {
      try {
        const res = await fetch(`${API_BASE}/client/my-coach`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("No coach assigned");
        const data = await res.json();
        setCoachId(data.coach_id);
      } catch {
        setError("No coach assigned to your account.");
        setLoading(false);
      }
    }
    fetchCoach();
  }, []);

  // Paso 2: obtener o crear conversación + nombre del coach
  useEffect(() => {
    if (!coachId) return;
    async function fetchConversation() {
      try {
        const res = await fetch(`${API_BASE}/chat/conversation?coach_id=${coachId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Failed to get conversation");
        const data = await res.json();
        setConversation(data);

        // Obtener nombre del coach
        const nameRes = await fetch(`${API_BASE}/users/${coachId}/name`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (nameRes.ok) {
          const nameData = await nameRes.json();
          setCoachName(nameData.full_name);
        }
      } catch {
        setError("Could not load conversation.");
        setLoading(false);
      }
    }
    fetchConversation();
  }, [coachId]);

  // Paso 3: cargar mensajes y polling cada 5s
  useEffect(() => {
    if (!conversation) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [conversation]);

  // Scroll al fondo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    if (!conversation) return;
    try {
      const res = await fetch(`${API_BASE}/chat/${conversation.conversation_id}/messages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !conversation) return;

    const content = message.trim();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/chat/${conversation.conversation_id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
    } catch {
      setError("Failed to send message.");
    }
  }

  return (
    <MemberPortalShell
      activePage="chat"
      title="MESSAGES"
      subtitle={`Chatting with ${coachName}`}
    >
      <div className="hh-card" style={{ height: "60vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>

        {loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
            Loading...
          </div>
        )}

        {error && !loading && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b", padding: 24 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Header con nombre del coach */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #2c2c30", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--hh-accent-20)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--hh-accent-light)", fontSize: 15, flexShrink: 0 }}>
                {coachName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>{coachName}</div>
                <div style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>Your Coach</div>
              </div>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.length === 0 && (
                <p style={{ color: "#aaa", textAlign: "center", marginTop: 32 }}>No messages yet. Say hi!</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div key={msg.message_id} style={{ display: "flex", gap: 12, alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                    {!isMe && (
                      <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--hh-accent-20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontWeight: 700, color: "var(--hh-accent-light)", fontSize: 13 }}>
                        {coachName.charAt(0)}
                      </div>
                    )}
                    <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: isMe ? "var(--hh-accent)" : "var(--hh-bg-elevated)", color: "white" }}>
                      <p style={{ fontSize: 14, margin: 0 }}>{msg.content}</p>
                      <p style={{ fontSize: 11, margin: "4px 0 0", opacity: 0.6 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: 16, borderTop: "1px solid #2c2c30", display: "flex", gap: 12, backgroundColor: "var(--hh-bg-card)" }}>
              <input
                className="hh-input"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button type="submit" className="btn btn--primary" style={{ padding: "0 16px" }}>
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </MemberPortalShell>
  );
}