"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { LoginCredentials, LoginResponse } from "@/types/auth";
import { authService } from "@/services/authService";
import { ROLE_REDIRECTS } from "@/router/router";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/a7e86414-ace0-4453-880e-a2a2325cf9d8";
const ICON_EMAIL =
  "https://www.figma.com/api/mcp/asset/8e260993-dc4a-4e04-91e4-a848b626f94b";
const ICON_LOCK =
  "https://www.figma.com/api/mcp/asset/192f30cb-3975-46ec-a999-3899233754db";
const ICON_EYE =
  "https://www.figma.com/api/mcp/asset/3dfa854a-511f-42d0-8389-46b4b19e96f4";

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = (
      document.getElementById("email") as HTMLInputElement
    ).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
   console.log({email, password})
      
      const data = await authService.login({ email, password });
      setAuth(data.token, data.user);
  
      router.push(ROLE_REDIRECTS[String(data.user.role)] ?? "/dashboards/user");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left__glow" aria-hidden="true" />
        <div className="auth-left__content">
          <a href="/" className="hh-logo" aria-label="HeraHealth Home">
            <div className="hh-logo__icon hh-logo__icon--lg">
              <img src={LOGO_ICON} alt="" width={20} height={20} />
            </div>
            <span className="hh-logo__text hh-logo__text--lg">HeraHealth</span>
          </a>
          <h2 className="auth-left__headline">
            YOUR BEST ERA
            <br />
            STARTS HERE.
          </h2>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Heading */}
          <h1 className="auth-heading__title">Welcome back</h1>
          <p className="auth-heading__sub">
            Sign in to continue your training journey.
          </p>

          {/* Google button */}
          <button
            className="btn btn--google"
            type="button"
            aria-label="Continue with Google"
          >
            Continue with Google
          </button>

          {/* Divider */}
          <div className="hh-divider" aria-hidden="true">
            <div className="hh-divider__line" />
            <span className="hh-divider__label">or sign in with email</span>
            <div className="hh-divider__line" />
          </div>

          {/* Form */}
          <form className="hh-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="hh-field">
              <label htmlFor="email" className="hh-field__label">
                Email
              </label>
              <div className="hh-input-wrap">
                <img
                  src={ICON_EMAIL}
                  alt=""
                  width={16}
                  height={16}
                  className="hh-input-wrap__icon"
                />
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
              <div className="hh-field__row">
                <label htmlFor="password" className="hh-field__label">
                  Password
                </label>
                <a href="/forgot-password" className="hh-forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="hh-input-wrap">
                <img
                  src={ICON_LOCK}
                  alt=""
                  width={16}
                  height={16}
                  className="hh-input-wrap__icon"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {/* Error */}
            {error && <p className="hh-error-msg">{error}</p>}

            {/* Submit */}
            <button type="submit" className="btn btn--submit">
              Sign In
            </button>
          </form>

          {/* Dev hint — remove before production */}

          {/* Demo portals */}
          {/* <div className="hh-demo-box">
            <p className="hh-demo-box__label">Quick access demo portals:</p>
            <div className="hh-demo-box__buttons">
              <a href="/dashboards/user" className="hh-badge">
                User Portal
              </a>
              <a href="/dashboards/coach" className="hh-badge">
                Coach Portal
              </a>
              <a href="/dashboards/admin" className="hh-badge">
                Admin Portal
              </a>
            </div>
          </div> */}

          {/* Sign-up prompt */}
          <p className="hh-auth-prompt">
            Don&apos;t have an account?{" "}
            <a href="/auth/signup" className="hh-auth-prompt__link">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
