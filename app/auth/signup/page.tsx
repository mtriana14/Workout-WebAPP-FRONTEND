"use client";

import { useState } from "react";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON_LG  = "https://www.figma.com/api/mcp/asset/7ebb7f9f-f182-477e-a95a-d5a3fb16c29d";
const LOGO_ICON_SM  = "https://www.figma.com/api/mcp/asset/57db21ab-8089-480e-96fa-ec916762d540";
const ICON_USER     = "https://www.figma.com/api/mcp/asset/cdb16f5e-7f22-44d4-9557-e72a176b214b";
const ICON_EMAIL    = "https://www.figma.com/api/mcp/asset/ac8a10f9-fb17-4fbd-9ed5-377b0177bf43";
const ICON_LOCK     = "https://www.figma.com/api/mcp/asset/eedd6957-a418-4805-b0df-feff127a1ac9";
const ICON_EYE      = "https://www.figma.com/api/mcp/asset/be0f2571-fb30-432d-93d3-7aa3e8f4f992";

export default function CreateAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed]             = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        :root {
          --color-bg:           #111113;
          --color-bg-card:      #1b1b1d;
          --color-border:       #2c2c30;
          --color-text-primary: #f5f5f5;
          --color-text-muted:   #898994;
          --color-text-border:  #767676;
          --color-accent:       #915985;
          --color-accent-20:    rgba(145,89,133,0.2);
          --color-accent-30:    rgba(145,89,133,0.3);
          --font-body:    'Inter', sans-serif;
          --font-display: 'Barlow Condensed', sans-serif;
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

        /* Input focus ring */
        .ca-input:focus {
          outline: none;
          border-color: var(--color-accent) !important;
        }

        /* Checkbox custom style */
        .ca-checkbox {
          appearance: none;
          -webkit-appearance: none;
          width: 13px;
          height: 13px;
          min-width: 13px;
          border: 1px solid #767676;
          border-radius: 2.5px;
          background: #fff;
          cursor: pointer;
          margin-top: 2px;
          position: relative;
        }
        .ca-checkbox:checked {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        .ca-checkbox:checked::after {
          content: '';
          position: absolute;
          left: 3px; top: 1px;
          width: 5px; height: 8px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .ca-left    { display: none !important; }
          .ca-right   { flex: 1 1 100% !important; padding: 40px 24px !important; }
          .ca-wrap    { max-width: 100% !important; width: 100% !important; }
        }
        @media (max-width: 768px) {
          .ca-right   { padding: 32px 16px !important; }
          .ca-name-row { flex-direction: column !important; gap: 16px !important; }
        }
      `}</style>

      {/* ── Root ── */}
      <div style={S.root}>

        {/* ── LEFT PANEL ── */}
        <div className="ca-left" style={S.left}>
          <div style={S.leftGlow} aria-hidden="true" />
          <div style={S.leftContent}>
            {/* Logo */}
            <a href="/" style={S.logoLink} aria-label="HeraHealth Home">
              <div style={S.logoIconLg}>
                <img src={LOGO_ICON_LG} alt="" width={20} height={20} />
              </div>
              <span style={S.logoTextLg}>HeraHealth</span>
            </a>
            {/* Headline */}
            <h2 style={S.headline}>
              YOUR BEST ERA<br />STARTS HERE.
            </h2>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="ca-right" style={S.right}>
          <div className="ca-wrap" style={S.formWrap}>

            {/* Small logo (right panel) */}
            <a href="/" style={S.logoLinkSm} aria-label="HeraHealth Home">
              <div style={S.logoIconSm}>
                <img src={LOGO_ICON_SM} alt="" width={16} height={16} />
              </div>
              <span style={S.logoTextSm}>HeraHealth</span>
            </a>

            {/* Heading */}
            <div style={S.headingGroup}>
              <h1 style={S.h1}>Create your account</h1>
              <p style={S.subtext}>Start your transformation journey today.</p>
            </div>

            {/* Google button */}
            <button style={S.googleBtn} type="button" aria-label="Continue with Google">
              Continue with Google
            </button>

            {/* Divider */}
            <div style={S.dividerWrap} aria-hidden="true">
              <div style={S.dividerLine} />
              <span style={S.dividerLabel}>or register with email</span>
              <div style={S.dividerLine} />
            </div>

            {/* Form */}
            <form style={S.form} onSubmit={(e) => e.preventDefault()} noValidate>

              {/* First / Last Name row */}
              <div className="ca-name-row" style={S.nameRow}>
                {/* First Name */}
                <div style={S.fieldGroup}>
                  <label htmlFor="firstName" style={S.label}>First Name</label>
                  <div style={S.inputWrap}>
                    <img src={ICON_USER} alt="" width={16} height={16} style={S.inputIcon} />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Alex"
                      autoComplete="given-name"
                      className="ca-input"
                      style={S.input}
                    />
                  </div>
                </div>

                {/* Last Name — no icon per Figma design */}
                <div style={S.fieldGroup}>
                  <label htmlFor="lastName" style={S.label}>Last Name</label>
                  <div style={S.inputWrap}>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Morgan"
                      autoComplete="family-name"
                      className="ca-input"
                      style={{ ...S.input, paddingLeft: 12 }}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div style={S.fieldGroup}>
                <label htmlFor="email" style={S.label}>Email</label>
                <div style={S.inputWrap}>
                  <img src={ICON_EMAIL} alt="" width={16} height={16} style={S.inputIcon} />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    autoComplete="email"
                    className="ca-input"
                    style={S.input}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={S.fieldGroup}>
                <label htmlFor="password" style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <img src={ICON_LOCK} alt="" width={16} height={16} style={S.inputIcon} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8+ characters"
                    autoComplete="new-password"
                    className="ca-input"
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

              {/* Terms checkbox */}
              <div style={S.termsRow}>
                <input
                  id="terms"
                  type="checkbox"
                  className="ca-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms" style={S.termsLabel}>
                  I agree to the{" "}
                  <a href="/terms"   style={S.termsLink}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" style={S.termsLink}>Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" style={S.submitBtn}>
                Create Account
              </button>

            </form>

            {/* Sign-in prompt */}
            <p style={S.signinPrompt}>
              Already have an account?{" "}
              <a href="/auth/login" style={S.signinLink}>Sign in</a>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {

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
    padding: 64,
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  logoLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 64,
  },
  logoIconLg: {
    width: 36,
    height: 36,
    background: "#915985",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoTextLg: {
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
  },

  /* Right panel */
  right: {
    flex: "0 0 50%",
    background: "#111113",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: "100vh",
  },
  formWrap: {
    width: "100%",
    maxWidth: 448,
    display: "flex",
    flexDirection: "column",
  },

  /* Small logo (right panel) */
  logoLinkSm: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoIconSm: {
    width: 32,
    height: 32,
    background: "#915985",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoTextSm: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: "1.28px",
    color: "#f5f5f5",
    whiteSpace: "nowrap",
  },

  /* Heading */
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
    height: 16,
    marginBottom: 16,
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
  nameRow: {
    display: "flex",
    gap: 12,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
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

  /* Terms */
  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 4,
  },
  termsLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "16px",
    color: "#898994",
    cursor: "pointer",
  },
  termsLink: {
    color: "#915985",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "16px",
  },

  /* Submit */
  submitBtn: {
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
  },

  /* Sign-in prompt */
  signinPrompt: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: "20px",
    color: "#898994",
    textAlign: "center" as const,
  },
  signinLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "20px",
    color: "#915985",
  },
};