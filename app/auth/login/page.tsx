"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Dumbbell, Eye, EyeOff, Lock, Mail } from "lucide-react";

import type { CredentialResponse } from "@react-oauth/google";

import { GoogleAuthButton } from "@/app/components/GoogleAuthButton";
import { getDashboardRouteForRole, googleSignInRequest, loginRequest, storeAuthSession } from "@/app/lib/api";
import { ROLE_REDIRECTS } from "@/router/router";
import { useAuthStore } from "@/store/authStore";
import type { AuthUser } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginRequest(email.trim(), password);
      storeAuthSession({
        token: response.token,
        user: response.user,
      });
      setAuth(response.token, response.user as AuthUser);
      router.push(ROLE_REDIRECTS[String(response.user.role)] ?? "/dashboards/client");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed.");
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const response = await googleSignInRequest(credentialResponse.credential);
      storeAuthSession({ token: response.token, user: response.user });
      setAuth(response.token, response.user as AuthUser);
      router.push(getDashboardRouteForRole(response.user.role));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Google sign-in failed.");
      setIsSubmitting(false);
    }
  }

  function handleGoogleError() {
    setError("Google sign-in failed. Please try again.");
  }

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-left__glow" aria-hidden="true" />
        <div className="auth-left__content">
          <Link href="/" className="hh-logo" aria-label="HeraHealth Home">
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
          <h1 className="auth-heading__title">Welcome back</h1>
          <p className="auth-heading__sub">Sign in to continue your training journey.</p>

          {googleClientId ? (
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="signin_with"
            />
          ) : null}

          {googleClientId ? (
            <div className="hh-divider" aria-hidden="true">
              <div className="hh-divider__line" />
              <span className="hh-divider__label">or sign in with email</span>
              <div className="hh-divider__line" />
            </div>
          ) : null}

          <form className="hh-form" onSubmit={handleSubmit} noValidate>
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
                />
              </div>
            </div>

            <div className="hh-field">
              <div className="hh-field__row">
                <label htmlFor="password" className="hh-field__label">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="hh-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="hh-input-wrap">
                <Lock size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
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
                  className="hh-input__eye-btn"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="var(--hh-text-muted)" />
                  ) : (
                    <Eye size={16} color="var(--hh-text-muted)" />
                  )}
                </button>
              </div>
            </div>

            {error ? <p className="hh-error-msg">{error}</p> : null}

            <button type="submit" className="btn btn--submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="hh-auth-prompt" style={{ marginTop: 24 }}>
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
