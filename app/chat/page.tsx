"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { chatService, ChatMessage, Conversation } from "@/services/chatService";
import { clientDashboardService } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function ClientChatPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [coachName, setCoachName] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"loading" | "no-coach" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      try {
        setStatus("loading");

        const coachData = await clientDashboardService.getMyCoach(Number(userId));
        if (!coachData.coach) {
          setStatus("no-coach");
          return;
        }

        setCoachName(coachData.coach.name);
        const coachUserId = coachData.coach.user_id;
        const convoRes = await chatService.getOrCreateConversation(coachUserId);
        const convo = convoRes.Conversation;
        setConversation(convo);

        const msgs = await chatService.getMessages(convo.MessageList_id);
        setMessages(msgs);

        const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.emit("join", { conversation_id: convo.MessageList_id });

        socket.on("new_message", (msg: ChatMessage) => {
          setMessages((prev) => [...prev, msg]);
        });

        setStatus("ready");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load chat.");
        setStatus("error");
      }
    };

    void init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !conversation || !userId || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      conversation_id: conversation.MessageList_id,
      sender_id: Number(userId),
      content: input.trim(),
    });

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <MemberPortalShell activePage="chat" title="MESSAGES" subtitle="Communicate directly with your assigned coach.">
      {status === "loading" && (
        <div className="hh-card">
          <p style={{ color: "var(--hh-text-muted)" }}>Connecting to chat...</p>
        </div>
      )}

      {status === "no-coach" && (
        <div className="hh-card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ color: "var(--hh-text-muted)", marginBottom: 16 }}>
            You need a coach before you can chat.
          </p>
          <a href="/dashboards/client/coaches" className="btn btn--primary">
            Find a Coach
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="hh-card">
          <p style={{ color: "var(--hh-error)" }}>{errorMsg}</p>
        </div>
      )}

      {status === "ready" && conversation && (
        <div className="hh-card" style={{ height: "60vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--hh-border)", fontSize: 14, fontWeight: 600 }}>
            {coachName || "Your Coach"}
          </div>

          <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.length === 0 && (
              <p style={{ color: "var(--hh-text-muted)", textAlign: "center", marginTop: 32 }}>
                No messages yet. Say hello!
              </p>
            )}
            {messages.map((msg) => {
              const isMe = msg.sender_id === Number(userId);
              return (
                <div key={msg.message_id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "70%" }}>
                    <div style={{
                      padding: "10px 14px",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMe ? "var(--hh-accent)" : "var(--hh-bg-card-dark)",
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "var(--hh-text-primary)",
                    }}>
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

          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            style={{ padding: "12px 16px", borderTop: "1px solid var(--hh-border)", display: "flex", gap: 10 }}
          >
            <input
              className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Send size={14} /> Send
            </button>
          </form>
        </div>
      )}
    </MemberPortalShell>
  );
}
