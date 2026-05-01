"use client";

import { useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { Dumbbell } from "lucide-react";

export default function BecomeCoachPage() {
  const { user } = useAuthStore();
  const [qualifications, setQualifications] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [documentLinks, setDocumentLinks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    if (!qualifications.trim() || !specialty.trim()) {
      showToast("Qualifications and specialty are required.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient("coach/apply", {
        method: "POST",
        body: {
          qualifications: qualifications.trim(),
          specialty:      specialty.trim(),
          document_links: documentLinks.trim() || null,
        },
      });
      showToast("Application submitted! An admin will review it shortly.", "success");
      setQualifications("");
      setSpecialty("");
      setDocumentLinks("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to submit application.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hh-dash-root">
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 8, backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)", color: "white", fontSize: 14, fontWeight: 500, zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.message}
        </div>
      )}

      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
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
            <h1 className="hh-page-title">BECOME A COACH</h1>
            <p className="hh-page-subtitle">Submit your application to join HeraHealth as a coach</p>
          </div>

          {/* Info Banner */}
          <div style={{ padding: "14px 20px", borderRadius: 8, backgroundColor: "rgba(var(--hh-accent-rgb), 0.08)", border: "1px solid var(--hh-accent)" }}>
            <p style={{ margin: 0, fontSize: 14, color: "var(--hh-accent)", fontWeight: 500 }}>
              📋 Your application will be reviewed by an admin. You'll receive a notification once a decision is made.
            </p>
          </div>

          {/* Form */}
          <div className="hh-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="hh-field">
              <label className="hh-field__label">Specialty *</label>
              <input
                type="text"
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                placeholder="e.g. Strength & Conditioning, Yoga, Nutrition..."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div className="hh-field">
              <label className="hh-field__label">Qualifications *</label>
              <textarea
                className="hh-input"
                placeholder="Describe your certifications, experience, and training background..."
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                rows={5}
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="hh-field">
              <label className="hh-field__label">Document Links <span style={{ color: "var(--hh-text-muted)", fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text"
                className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                placeholder="Links to certifications or portfolio (comma-separated)"
                value={documentLinks}
                onChange={(e) => setDocumentLinks(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ padding: "12px 24px", border: "none", borderRadius: 8, backgroundColor: "var(--hh-accent)", color: "white", fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, alignSelf: "flex-start" }}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}