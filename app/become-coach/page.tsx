"use client";

import { useState } from "react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { getStoredAuthToken, applyForCoachRequest } from "@/app/lib/api";

export default function BecomeCoachPage() {
  const [specialty, setSpecialty] = useState("fitness");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = getStoredAuthToken();
    if (!token) return;

    try {
      setIsSubmitting(true);
      setError("");
      
      await applyForCoachRequest(token, {
        specialty: specialty, // FIX: Changed from 'specialization' to 'specialty'
        experience_years: parseInt(experience) || 0,
        certifications: certifications
      });
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MemberPortalShell
      activePage="profile"
      title="BECOME A COACH"
      subtitle="Submit your application to start training clients on our platform."
    >
      <div className="hh-card" style={{ maxWidth: 600 }}>
        {success ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <h2 className="hh-panel-heading" style={{ color: "var(--hh-green)" }}>Application Submitted!</h2>
            <p className="hh-portal-card-copy">
              Your application has been sent to our administrators for verification. You will be notified once a decision has been made.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {error && <p className="hh-error-msg">{error}</p>}
            
            <div className="hh-field">
              <label className="hh-field__label">Coach Specialization</label>
              <select className="hh-input" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                <option value="fitness">Fitness / Personal Training</option>
                <option value="nutrition">Nutrition / Dietetics</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="hh-field">
              <label className="hh-field__label">Years of Experience</label>
              <input 
                type="number" 
                className="hh-input" 
                placeholder="e.g. 5"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>

            <div className="hh-field">
              <label className="hh-field__label">Certifications & Qualifications</label>
              <textarea 
                className="hh-portal-textarea" 
                placeholder="List your relevant degrees, NASM/ACE certifications, etc."
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </MemberPortalShell>
  );
}