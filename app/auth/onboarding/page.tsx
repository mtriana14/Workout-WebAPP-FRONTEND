"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dumbbell, Calendar, Ruler, Scale, UserCircle } from "lucide-react";

import {
  getStoredAuthToken,
  getStoredAuthSession,
  getDashboardRouteForRole,
  updateCurrentProfile,
} from "@/app/lib/api";

export default function OnboardingPage() {
  const [dob, setDob] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("prefer_not_to_say");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) {
      window.location.assign("/auth/login");
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const token = getStoredAuthToken();
    const session = getStoredAuthSession();

    if (!token || !session) {
      setError("Authentication lost. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        date_of_birth: dob || null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        gender: gender,
      };

      await updateCurrentProfile(token, payload);
      
      window.location.assign(getDashboardRouteForRole(session.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save profile.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__glow" aria-hidden="true" />
        <div className="auth-left__content">
          <Link href="/" className="hh-logo" aria-label="HeraHealth Home" style={{ marginBottom: 64 }}>
            <div className="hh-logo__icon hh-logo__icon--lg">
              <Dumbbell size={20} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--lg">HeraHealth</span>
          </Link>
          <h2 className="auth-left__headline">
            TELL US ABOUT
            <br />
            YOURSELF.
          </h2>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 className="auth-heading__title">Complete your profile</h1>
          <p className="auth-heading__sub">This information helps coaches design the perfect program for you.</p>

          <form className="hh-form" onSubmit={handleSubmit} noValidate>
            
            <div className="hh-field">
              <label htmlFor="dob" className="hh-field__label">Date of Birth</label>
              <div className="hh-input-wrap">
                <Calendar size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                <input
                  id="dob"
                  type="date"
                  className="hh-input"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div className="hh-field-row">
              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="height" className="hh-field__label">Height (inches)</label>
                <div className="hh-input-wrap">
                  <Ruler size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70.5"
                    className="hh-input"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="weight" className="hh-field__label">Weight (lbs)</label>
                <div className="hh-input-wrap">
                  <Scale size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 165.0"
                    className="hh-input"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="hh-field">
              <label htmlFor="gender" className="hh-field__label">Gender</label>
              <div className="hh-input-wrap">
                <UserCircle size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                <select 
                  id="gender" 
                  className="hh-input" 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  style={{ appearance: "auto", cursor: "pointer" }}
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {error ? <p className="hh-error-msg">{error}</p> : null}

            <button type="submit" className="btn btn--submit" disabled={isSubmitting} style={{ marginTop: 16 }}>
              {isSubmitting ? "Saving..." : "Go to Dashboard"}
            </button>
            
            <button 
                type="button" 
                className="btn btn--ghost" 
                onClick={() => window.location.assign(getDashboardRouteForRole(getStoredAuthSession()?.user?.role || "client"))}
                style={{ width: "100%", marginTop: 8 }}
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}