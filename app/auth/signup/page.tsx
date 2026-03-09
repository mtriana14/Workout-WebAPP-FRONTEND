"use client";

import { useState } from "react";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON_LG = "https://www.figma.com/api/mcp/asset/7ebb7f9f-f182-477e-a95a-d5a3fb16c29d";
const LOGO_ICON_SM = "https://www.figma.com/api/mcp/asset/57db21ab-8089-480e-96fa-ec916762d540";
const ICON_USER    = "https://www.figma.com/api/mcp/asset/cdb16f5e-7f22-44d4-9557-e72a176b214b";
const ICON_EMAIL   = "https://www.figma.com/api/mcp/asset/ac8a10f9-fb17-4fbd-9ed5-377b0177bf43";
const ICON_LOCK    = "https://www.figma.com/api/mcp/asset/eedd6957-a418-4805-b0df-feff127a1ac9";
const ICON_EYE     = "https://www.figma.com/api/mcp/asset/be0f2571-fb30-432d-93d3-7aa3e8f4f992";

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreateAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed]             = useState(false);

  return (
    <div className="auth-root">

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left__glow" aria-hidden="true" />
        <div className="auth-left__content">
          <a href="/" className="hh-logo" aria-label="HeraHealth Home" style={{ marginBottom: 64 }}>
            <div className="hh-logo__icon hh-logo__icon--lg">
              <img src={LOGO_ICON_LG} alt="" width={20} height={20} />
            </div>
            <span className="hh-logo__text hh-logo__text--lg">HeraHealth</span>
          </a>
          <h2 className="auth-left__headline">
            YOUR BEST ERA<br />STARTS HERE.
          </h2>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Small logo in right panel */}
          <a href="/" className="hh-logo" aria-label="HeraHealth Home" style={{ marginBottom: 24 }}>
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON_SM} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--sm">HeraHealth</span>
          </a>

          {/* Heading */}
          <h1 className="auth-heading__title">Create your account</h1>
          <p className="auth-heading__sub">Start your transformation journey today.</p>

          {/* Google button */}
          <button className="btn btn--google" type="button" aria-label="Continue with Google">
            Continue with Google
          </button>

          {/* Divider */}
          <div className="hh-divider" aria-hidden="true">
            <div className="hh-divider__line" />
            <span className="hh-divider__label">or register with email</span>
            <div className="hh-divider__line" />
          </div>

          {/* Form */}
          <form className="hh-form" onSubmit={(e) => e.preventDefault()} noValidate>

            {/* First / Last name row */}
            <div className="hh-field-row">
              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="firstName" className="hh-field__label">First Name</label>
                <div className="hh-input-wrap">
                  <img src={ICON_USER} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Alex"
                    autoComplete="given-name"
                    className="hh-input"
                  />
                </div>
              </div>

              <div className="hh-field" style={{ flex: 1 }}>
                <label htmlFor="lastName" className="hh-field__label">Last Name</label>
                <div className="hh-input-wrap">
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Morgan"
                    autoComplete="family-name"
                    className="hh-input hh-input--no-icon-left"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="hh-field">
              <label htmlFor="email" className="hh-field__label">Email</label>
              <div className="hh-input-wrap">
                <img src={ICON_EMAIL} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="hh-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="hh-field">
              <label htmlFor="password" className="hh-field__label">Password</label>
              <div className="hh-input-wrap">
                <img src={ICON_LOCK} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ characters"
                  autoComplete="new-password"
                  className="hh-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="hh-input__eye-btn"
                >
                  <img src={ICON_EYE} alt="" width={16} height={16} />
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="hh-terms-row">
              <input
                id="terms"
                type="checkbox"
                className="hh-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms" className="hh-terms-row__label">
                I agree to the{" "}
                <a href="/terms"   className="hh-terms-row__link">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" className="hh-terms-row__link">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn--submit">Create Account</button>

          </form>

          {/* Sign-in prompt */}
          <p className="hh-auth-prompt">
            Already have an account?{" "}
            <a href="/auth/login" className="hh-auth-prompt__link">Sign in</a>
          </p>

        </div>
      </div>
    </div>
  );
}