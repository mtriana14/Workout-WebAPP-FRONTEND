"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { resetPasswordRequest } from "@/app/lib/api";

type Step = "email" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailContinue(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setStep("password");
  }

  async function handleReset(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordRequest(email.trim(), password);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="hh-auth-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="hh-card" style={{ maxWidth: 400, width: "100%" }}>

        {step !== "done" && (
          <button
            onClick={() => step === "password" ? setStep("email") : router.push("/auth/login")}
            className="btn btn--ghost"
            style={{ padding: 0, marginBottom: 24, color: "var(--hh-text-muted)" }}
          >
            <ArrowLeft size={16} style={{ marginRight: 8 }} />
            {step === "password" ? "Back" : "Back to Login"}
          </button>
        )}

        <h1 className="hh-panel-heading" style={{ fontSize: 24, marginBottom: 8 }}>Reset Password</h1>

        {step === "email" && (
          <>
            <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
              Enter the email address associated with your account.
            </p>
            <form onSubmit={handleEmailContinue} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label" htmlFor="email">Email Address</label>
                <div className="hh-input-wrap">
                  <Mail size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="email"
                    type="email"
                    className="hh-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn btn--primary" disabled={!email.trim()}>
                Continue
              </button>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
              Choose a new password for <strong>{email}</strong>.
            </p>
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label" htmlFor="password">New Password</label>
                <div className="hh-input-wrap">
                  <Lock size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="hh-input"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="hh-input__eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} color="var(--hh-text-muted)" /> : <Eye size={16} color="var(--hh-text-muted)" />}
                  </button>
                </div>
              </div>

              <div className="hh-field">
                <label className="hh-field__label" htmlFor="confirm">Confirm Password</label>
                <div className="hh-input-wrap">
                  <Lock size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    className="hh-input"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="hh-input__eye-btn"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <EyeOff size={16} color="var(--hh-text-muted)" /> : <Eye size={16} color="var(--hh-text-muted)" />}
                  </button>
                </div>
              </div>

              {error && <p className="hh-error-msg">{error}</p>}

              <button type="submit" className="btn btn--primary" disabled={isSubmitting || !password || !confirm}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle size={48} color="var(--hh-green)" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ color: "white", marginBottom: 8 }}>Password updated</h2>
            <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
              Your password has been reset. You can now sign in with your new password.
            </p>
            <button onClick={() => router.push("/auth/login")} className="btn btn--primary">
              Back to Login
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
