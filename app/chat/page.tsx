"use client";
import { useState } from "react";
import { Send, User as UserIcon } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "coach", text: "Hey! How are you feeling after yesterday's leg day?" },
    { sender: "user", text: "A bit sore, but feeling strong! Got my protein in." }
  ]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message) return;
    setChat([...chat, { sender: "user", text: message }]);
    setMessage("");
    // Fake coach reply
    setTimeout(() => {
      setChat(prev => [...prev, { sender: "coach", text: "Love to hear it. Make sure to stretch tonight!" }]);
    }, 1500);
  }

  return (
    <MemberPortalShell activePage="chat" title="MESSAGES" subtitle="Communicate directly with your assigned coach.">
      <div className="hh-card" style={{ height: "60vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
        
        <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {chat.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignSelf: msg.sender === "user" ? "flex-end" : "flex-start", maxWidth: "70%" }}>
              {msg.sender === "coach" && <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--hh-bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}><UserIcon size={16} color="white" /></div>}
              <div style={{ padding: "12px 16px", borderRadius: 8, backgroundColor: msg.sender === "user" ? "var(--hh-accent)" : "var(--hh-bg-elevated)", color: "white" }}>
                <p style={{ fontSize: 14, margin: 0 }}>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

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

      </div>
    </MemberPortalShell>
  );
}