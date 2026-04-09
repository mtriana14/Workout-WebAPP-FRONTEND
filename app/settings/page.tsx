"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { getStoredAuthToken, deleteAccountRequest, clearAuthSession } from "@/app/lib/api";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDeleteAccount() {
    if (!password) {
      setError("You must enter your password to confirm deletion.");
      return;
    }

    const token = getStoredAuthToken();
    if (!token) return;

    const confirmed = window.confirm("Are you absolutely sure? This action is irreversible.");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setError("");
      await deleteAccountRequest(token, password);
      
      // Clear local storage and boot to login screen
      clearAuthSession();
      window.location.assign("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect Password! Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <MemberPortalShell
      activePage="settings"
      title="SETTINGS"
      subtitle="Manage your account preferences and security."
    >
      <div className="hh-card" style={{ border: "1px solid rgba(220, 53, 69, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <AlertTriangle color="#dc3545" size={24} />
          <h2 className="hh-panel-heading" style={{ margin: 0, color: "#dc3545" }}>Danger Zone</h2>
        </div>
        
        <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>

        {error && <p className="hh-error-msg" style={{ marginBottom: 16 }}>{error}</p>}

        <div className="hh-field" style={{ maxWidth: 300, marginBottom: 16 }}>
          <label className="hh-field__label">Confirm Password</label>
          <input
            type="password"
            className="hh-input"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          className="btn" 
          style={{ backgroundColor: "#dc3545", color: "white" }}
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </MemberPortalShell>
  );
}