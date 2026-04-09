"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { fakePasswordResetRequest } from "@/app/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate backend network request
    await fakePasswordResetRequest(email);
    setIsSubmitting(false);
    setIsSuccess(true);
  }

  return (
    <main className="hh-auth-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="hh-card" style={{ maxWidth: 400, width: "100%" }}>
        
        <button 
          onClick={() => router.push("/auth/login")}
          className="btn btn--ghost" 
          style={{ padding: 0, marginBottom: 24, color: "var(--hh-text-muted)" }}
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Back to Login
        </button>

        <h1 className="hh-panel-heading" style={{ fontSize: 24, marginBottom: 8 }}>Account Recovery</h1>
        
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={48} color="var(--hh-green)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ color: "white", marginBottom: 8 }}>Check your inbox</h2>
            <p className="hh-portal-card-copy">
              If an account exists for <strong>{email}</strong>, we have sent a password reset link.
            </p>
          </div>
        ) : (
          <>
            <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
              Enter the email associated with your account and we will send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="hh-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn--primary" disabled={isSubmitting || !email}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}