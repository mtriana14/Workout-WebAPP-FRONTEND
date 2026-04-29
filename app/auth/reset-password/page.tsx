"use client";

import { useState } from "react";
import Link from "next/link";

import { profileService } from "@/services/profileService";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      setSaving(true);
      const response = await profileService.resetPassword({ email, new_password: newPassword });
      setStatus({ type: "success", message: response.Success ?? "Password reset successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to reset password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="hh-auth-shell">
      <section className="hh-auth-card">
        <p className="hh-auth-eyebrow">Account Recovery</p>
        <h1 className="hh-auth-title">Reset Password</h1>
        <p className="hh-auth-subtitle">Enter your account email and choose a new password.</p>

        {status ? <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p> : null}

        <form onSubmit={submit} className="hh-form">
          <div className="hh-field">
            <label className="hh-field__label">Email</label>
            <input className="hh-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="hh-field">
            <label className="hh-field__label">New Password</label>
            <input className="hh-input" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} />
          </div>
          <div className="hh-field">
            <label className="hh-field__label">Confirm Password</label>
            <input className="hh-input" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} />
          </div>
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Link href="/auth/login" className="hh-portal-inline-link" style={{ marginTop: 16, display: "inline-block" }}>
          Back to login
        </Link>
      </section>
    </main>
  );
}
