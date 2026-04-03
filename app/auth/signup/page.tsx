"use client";

import Link from "next/link";
import { useState } from "react";

import {
  getDashboardRouteForRole,
  signupRequest,
  storeAuthSession,
} from "@/app/lib/api";

const LOGO_ICON_LG = "https://www.figma.com/api/mcp/asset/7ebb7f9f-f182-477e-a95a-d5a3fb16c29d";
const LOGO_ICON_SM = "https://www.figma.com/api/mcp/asset/57db21ab-8089-480e-96fa-ec916762d540";
const ICON_USER = "https://www.figma.com/api/mcp/asset/cdb16f5e-7f22-44d4-9557-e72a176b214b";
const ICON_EMAIL = "https://www.figma.com/api/mcp/asset/ac8a10f9-fb17-4fbd-9ed5-377b0177bf43";
const ICON_LOCK = "https://www.figma.com/api/mcp/asset/eedd6957-a418-4805-b0df-feff127a1ac9";
const ICON_EYE = "https://www.figma.com/api/mcp/asset/be0f2571-fb30-432d-93d3-7aa3e8f4f992";

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

    if (!agreed) {
      setError("You need to accept the terms before creating an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signupRequest(firstName.trim(), lastName.trim(), email.trim(), password);
      storeAuthSession({
        token: response.token,
        user: response.user,
      });
      window.location.assign(getDashboardRouteForRole(response.user.role));
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
              <img src={LOGO_ICON_LG} alt="" width={20} height={20} />
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
              <img src={LOGO_ICON_SM} alt="" width={16} height={16} />
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
                  <img src={ICON_USER} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Alex"
                    autoComplete="given-name"
                    className="hh-input"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
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
                  />
                </div>
              </div>
            </div>

            <div className="hh-field">
              <label htmlFor="email" className="hh-field__label">
                Email
              </label>
              <div className="hh-input-wrap">
                <img src={ICON_EMAIL} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="hh-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="hh-field">
              <label htmlFor="password" className="hh-field__label">
                Password
              </label>
              <div className="hh-input-wrap">
                <img src={ICON_LOCK} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  className="hh-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="hh-input__eye-btn"
                >
                  <img src={ICON_EYE} alt="" width={16} height={16} />
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
