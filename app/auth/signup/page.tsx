"use client";

import Link from "next/link";
import { useState } from "react";
import { Dumbbell, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

import {
  getDashboardRouteForRole,
  signupRequest,
  storeAuthSession,
} from "@/app/lib/api";

export default function CreateAccountPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const nextFirstName = firstName.trim();
    const nextLastName = lastName.trim();
    const nextEmail = email.trim();

    if (!nextFirstName || !nextLastName || !nextEmail || !password) {
      setError("First name, last name, email, and password are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreed) {
      setError("You need to accept the terms before creating an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signupRequest(nextFirstName, nextLastName, nextEmail, password);
      storeAuthSession({
        token: response.token,
        user: response.user,
      });      
      window.location.assign("/auth/onboarding");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create account.");
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
            YOUR BEST ERA
            <br />
            STARTS HERE.
          </h2>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <Link href="/" className="hh-logo" aria-label="HeraHealth Home" style={{ marginBottom: 24 }}>
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--sm">HeraHealth</span>
          </Link>

          <h1 className="auth-heading__title">Create your account</h1>
          <p className="auth-heading__sub">This will create a real user in the Flask backend and SQL database.</p>

          <button className="btn btn--google" type="button" aria-label="Continue with Google">
            Continue with Google
          </button>

          <div className="hh-divider" aria-hidden="true">
            <div className="hh-divider__line" />
            <span className="hh-divider__label">or register with email</span>
            <div className="hh-divider__line" />
          </div>

          <form className="hh-form" onSubmit={handleSubmit} noValidate>
            <div className="hh-field-row">
              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="firstName" className="hh-field__label">
                  First Name
                </label>
                <div className="hh-input-wrap">
                  <User size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Alex"
                    autoComplete="given-name"
                    className="hh-input"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="lastName" className="hh-field__label">
                  Last Name
                </label>
                <div className="hh-input-wrap">
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Morgan"
                    autoComplete="family-name"
                    className="hh-input hh-input--no-icon-left"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="hh-field">
              <label htmlFor="email" className="hh-field__label">
                Email
              </label>
              <div className="hh-input-wrap">
                <Mail size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="hh-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="hh-field">
              <label htmlFor="password" className="hh-field__label">
                Password
              </label>
              <div className="hh-input-wrap">
                <Lock size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  className="hh-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="hh-input__eye-btn"
                >
                  {showPassword ? (
                    <EyeOff size={16} color="var(--hh-text-muted)" />
                  ) : (
                    <Eye size={16} color="var(--hh-text-muted)" />
                  )}
                </button>
              </div>
            </div>

            <div className="hh-terms-row">
              <input
                id="terms"
                type="checkbox"
                className="hh-checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <label htmlFor="terms" className="hh-terms-row__label">
                I agree to the{" "}
                <span className="hh-terms-row__link">Terms of Service</span>
                {" "}and{" "}
                <span className="hh-terms-row__link">Privacy Policy</span>
              </label>
            </div>

            {error ? <p className="hh-error-msg">{error}</p> : null}

            <button type="submit" className="btn btn--submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="hh-auth-prompt">
            Already have an account?{" "}
            <Link href="/auth/login" className="hh-auth-prompt__link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}