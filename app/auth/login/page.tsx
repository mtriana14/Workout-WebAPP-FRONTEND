"use client";

import { useState } from "react";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON   = "https://www.figma.com/api/mcp/asset/a7e86414-ace0-4453-880e-a2a2325cf9d8";
const ICON_EMAIL  = "https://www.figma.com/api/mcp/asset/8e260993-dc4a-4e04-91e4-a848b626f94b";
const ICON_LOCK   = "https://www.figma.com/api/mcp/asset/192f30cb-3975-46ec-a999-3899233754db";
const ICON_EYE    = "https://www.figma.com/api/mcp/asset/3dfa854a-511f-42d0-8389-46b4b19e96f4";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DemoPortalButtonProps {
  label: string;
  href: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DemoPortalButton({ label, href }: DemoPortalButtonProps) {
  return (
    <a href={href} style={S.portalBtn}>
      {label}
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Google Fonts + base reset */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        :root {
          /* Colors */
          --color-bg:            #111113;
          --color-bg-card:       #1b1b1d;
          --color-bg-demo:       #222225;
          --color-border:        #2c2c30;
          --color-text-primary:  #f5f5f5;
          --color-text-muted:    #898994;
          --color-accent:        #915985;
          --color-accent-20:     rgba(145, 89, 133, 0.2);
          --color-accent-30:     rgba(145, 89, 133, 0.3);
          --color-accent-light:  #ab87a3;

          /* Fonts */
          --font-body:    'Inter', sans-serif;
          --font-display: 'Barlow Condensed', sans-serif;

          /* Font sizes */
          --fs-12: 12px;
          --fs-14: 14px;
          --fs-32: 32px;
          --fs-56: 56px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; }
        body {
          font-family: var(--font-body);
          background: var(--color-bg);
          color: var(--color-text-primary);
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; color: inherit; cursor: pointer; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-left    { display: none !important; }
          .login-right   { flex: 1 1 100% !important; padding: 40px 24px !important; }
          .login-form-wrap { max-width: 100% !important; width: 100% !important; }
        }

        @media (max-width: 768px) {
          .login-right   { padding: 32px 16px !important; }
          .login-form-wrap { padding: 0 !important; }
        }
      `}</style>

      {/* ── Root: two columns ── */}
      <div style={S.root}>

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={S.left}>
          {/* Radial glow overlay */}
          <div style={S.leftGlow} aria-hidden="true" />

          {/* Content pinned to vertical center */}
          <div style={S.leftContent}>

            {/* Logo */}
            <a href="/" style={S.logoLink} aria-label="HeraHealth Home">
              <div style={S.logoIcon}>
                <img src={LOGO_ICON} alt="" width={20} height={20} />
              </div>
              <span style={S.logoText}>HeraHealth</span>
            </a>

            {/* Headline */}
            <div style={{ paddingTop: 24 }}>
              <h2 style={S.headline}>
                YOUR BEST ERA<br />STARTS HERE.
              </h2>
            </div>

          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right" style={S.right}>
          <div className="login-form-wrap" style={S.formWrap}>

            {/* Heading */}
            <div style={S.headingGroup}>
              <h1 style={S.h1}>Welcome back</h1>
              <p style={S.subtext}>Sign in to continue your training journey.</p>
            </div>

            {/* Google button */}
            <button style={S.googleBtn} type="button" aria-label="Continue with Google">
              Continue with Google
            </button>

            {/* Divider */}
            <div style={S.dividerWrap} aria-hidden="true">
              <div style={S.dividerLine} />
              <span style={S.dividerLabel}>or sign in with email</span>
              <div style={S.dividerLine} />
            </div>

            {/* Form */}
            <form style={S.form} onSubmit={(e) => e.preventDefault()} noValidate>

              {/* Email field */}
              <div style={S.fieldGroup}>
                <label htmlFor="email" style={S.label}>Email</label>
                <div style={S.inputWrap}>
                  <img src={ICON_EMAIL} alt="" width={16} height={16} style={S.inputIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    style={S.input}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={S.fieldGroup}>
                <div style={S.passwordLabelRow}>
                  <label htmlFor="password" style={S.label}>Password</label>
                  <a href="/forgot-password" style={S.forgotLink}>Forgot password?</a>
                </div>
                <div style={S.inputWrap}>
                  <img src={ICON_LOCK} alt="" width={16} height={16} style={S.inputIcon} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={S.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={S.eyeBtn}
                  >
                    <img src={ICON_EYE} alt="" width={16} height={16} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" style={S.signInBtn}>
                Sign In
              </button>

            </form>

            {/* Demo portals box */}
            <div style={S.demoBox}>
              <p style={S.demoLabel}>Quick access demo portals:</p>
              <div style={S.demoButtons}>
                <DemoPortalButton label="User Portal"  href="/user/dashboard" />
                <DemoPortalButton label="Coach Portal" href="/coach/dashboard" />
                <DemoPortalButton label="Admin Portal" href="/admin/dashboard" />
              </div>
            </div>

            {/* Sign-up prompt */}
            <p style={S.signupPrompt}>
              Don&apos;t have an account?{" "}
              <a href="/auth/signup" style={S.signupLink}>Create one</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {

  /* Layout */
  root: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "#111113",
    fontFamily: "'Inter', sans-serif",
  },

  /* Left panel */
  left: {
    flex: "0 0 50%",
    position: "relative",
    background: "linear-gradient(135deg, #161618 0%, #3f273a 100%)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
  },
  leftGlow: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 30% 70%, rgba(145,89,133,0.15) 0%, rgba(145,89,133,0) 60%)",
    pointerEvents: "none",
  },
  leftContent: {
    position: "relative",
    zIndex: 1,
    padding: "64px",
    width: "100%",
  },
  logoLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: "#915985",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 22.4,
    lineHeight: "33.6px",
    letterSpacing: "1.792px",
    color: "#f5f5f5",
    whiteSpace: "nowrap",
  },
  headline: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 900,
    fontSize: 56,
    lineHeight: "56px",
    letterSpacing: "0.56px",
    color: "#f5f5f5",
    marginTop: 24,
  },

  /* Right panel */
  right: {
    flex: "0 0 50%",
    background: "#111113",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  formWrap: {
    width: "100%",
    maxWidth: 448,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  /* Heading group */
  headingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginBottom: 32,
  },
  h1: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 32,
    lineHeight: "48px",
    letterSpacing: "0.32px",
    color: "#f5f5f5",
  },
  subtext: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "20px",
    color: "#898994",
  },

  /* Google button */
  googleBtn: {
    width: "100%",
    height: 44,
    background: "#111113",
    border: "1px solid #2c2c30",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: "#f5f5f5",
    cursor: "pointer",
    marginBottom: 16,
  },

  /* Divider */
  dividerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    marginBottom: 16,
    height: 16,
  },
  dividerLine: {
    flex: 1,
    height: "0.6px",
    background: "#2c2c30",
  },
  dividerLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "16px",
    color: "#898994",
    background: "#111113",
    padding: "0 8px",
    whiteSpace: "nowrap",
  },

  /* Form */
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 16,
  },

  /* Field */
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: "#898994",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    pointerEvents: "none",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    height: 44,
    background: "#1b1b1d",
    border: "1px solid #2c2c30",
    borderRadius: 10,
    paddingLeft: 40,
    paddingRight: 40,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: "#f5f5f5",
    outline: "none",
  } as React.CSSProperties,
  passwordLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 20,
  },
  forgotLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "16px",
    color: "#915985",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: 16,
    height: 16,
  },

  /* Sign In button */
  signInBtn: {
    width: "100%",
    height: 44,
    background: "#915985",
    border: "none",
    borderRadius: 10,
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "20px",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },

  /* Demo portals box */
  demoBox: {
    background: "#222225",
    border: "1px solid #2c2c30",
    borderRadius: 12,
    padding: "16.6px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 16,
  },
  demoLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "16px",
    color: "#898994",
  },
  demoButtons: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  portalBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(145, 89, 133, 0.2)",
    border: "1px solid rgba(145, 89, 133, 0.3)",
    borderRadius: 9999,
    padding: "4.6px 12.6px",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: "16px",
    color: "#ab87a3",
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
  },

  /* Sign-up prompt */
  signupPrompt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "20px",
    color: "#898994",
    textAlign: "center" as const,
  },
  signupLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: "#915985",
    cursor: "pointer",
  },
};