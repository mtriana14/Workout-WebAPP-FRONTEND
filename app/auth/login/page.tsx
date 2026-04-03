"use client";

import Link from "next/link";
import { useState } from "react";

import {
  getDashboardRouteForRole,
  loginRequest,
  storeAuthSession,
} from "@/app/lib/api";

const LOGO_ICON = "https://www.figma.com/api/mcp/asset/a7e86414-ace0-4453-880e-a2a2325cf9d8";
const ICON_EMAIL = "https://www.figma.com/api/mcp/asset/8e260993-dc4a-4e04-91e4-a848b626f94b";
const ICON_LOCK = "https://www.figma.com/api/mcp/asset/192f30cb-3975-46ec-a999-3899233754db";
const ICON_EYE = "https://www.figma.com/api/mcp/asset/3dfa854a-511f-42d0-8389-46b4b19e96f4";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginRequest(email.trim(), password);
      storeAuthSession({
        token: response.token,
        user: response.user,
      });
      window.location.assign(getDashboardRouteForRole(response.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__glow" aria-hidden="true" />
        <div className="auth-left__content">
          <Link href="/" className="hh-logo" aria-label="HeraHealth Home">
            <div className="hh-logo__icon hh-logo__icon--lg">
              <img src={LOGO_ICON} alt="" width={20} height={20} />
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
          <h1 className="auth-heading__title">Welcome back</h1>
          <p className="auth-heading__sub">Sign in to load your dashboard from the Flask API.</p>

          <button className="btn btn--google" type="button" aria-label="Continue with Google">
            Continue with Google
          </button>

          <div className="hh-divider" aria-hidden="true">
            <div className="hh-divider__line" />
            <span className="hh-divider__label">or sign in with email</span>
            <div className="hh-divider__line" />
          </div>

          <form className="hh-form" onSubmit={handleSubmit} noValidate>
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
              <div className="hh-field__row">
                <label htmlFor="password" className="hh-field__label">
                  Password
                </label>
                <span className="hh-forgot-link">Reset flow not wired yet</span>
              </div>
              <div className="hh-input-wrap">
                <img src={ICON_LOCK} alt="" width={16} height={16} className="hh-input-wrap__icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {error ? <p className="hh-error-msg">{error}</p> : null}

            <button type="submit" className="btn btn--submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="hh-demo-box">
            <p className="hh-demo-box__label">Seeded backend accounts:</p>
            <div className="hh-hint-box" style={{ marginBottom: 0 }}>
              <p className="hh-hint-box__row">Client: `mike.client@fitnessapp.com` / `password123`</p>
              <p className="hh-hint-box__row">Coach: `john.coach@fitnessapp.com` / `password123`</p>
              <p className="hh-hint-box__row">Admin: `admin@fitnessapp.com` / `password123`</p>
            </div>
          </div>

          <p className="hh-auth-prompt">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="hh-auth-prompt__link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
