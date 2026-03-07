"use client"; 
import { BrowserRouter,Routes,Route } from "react-router-dom";
import { useState, useEffect } from "react";



// ─── Asset URLs (from Figma) ──────────────────────────────────────────────────
const LOGO_ICON   = "https://www.figma.com/api/mcp/asset/4f80479e-9707-41c3-ab0e-81f454820085";
const ICON_CAL    = "https://www.figma.com/api/mcp/asset/1b42fe3a-e33b-45d0-8e7d-57b32779b3d6";
const ICON_STEPS  = "https://www.figma.com/api/mcp/asset/b9e32d5d-6a4f-47d2-9b37-f927bbcd022a";
const ICON_BURN   = "https://www.figma.com/api/mcp/asset/5fc25fa1-e487-4c18-a6a7-233454ed969b";
const ICON_WO     = "https://www.figma.com/api/mcp/asset/ac49b4fe-3ab2-4549-80f9-1aa1c4136b07";
const ICON_PLAN   = "https://www.figma.com/api/mcp/asset/413a9f30-95c1-4b28-b8d7-e87af05770f9";
const ICON_EXP    = "https://www.figma.com/api/mcp/asset/4a881b36-4173-415b-8f05-3c9984340b7c";
const ICON_NUT    = "https://www.figma.com/api/mcp/asset/4a0462c0-a8ad-4d97-b27b-e9fa7d3dccda";
const ICON_PROG   = "https://www.figma.com/api/mcp/asset/88297202-12b1-4088-8d22-2bbc924bc9bb";
const FOOTER_ICON = "https://www.figma.com/api/mcp/asset/6436eee6-7271-4db2-bb82-dde12fc6d28a";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  icon: string;
  value: string;
  target: string;
  delta?: string;
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, icon, value, target, delta }: StatCardProps) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statCardHeader}>
        <span style={styles.statCardLabel}>{label}</span>
        <div style={styles.statCardIcon}>
          <img src={icon} alt="" width={16} height={16} />
        </div>
      </div>
      <div style={styles.statCardBody}>
        <span style={styles.statCardValue}>{value}</span>
        <span style={styles.statCardTarget}>{target}</span>
        {delta && <span style={styles.statCardDelta}>{delta}</span>}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        ...styles.featureCard,
        borderColor: hovered ? "#915985" : "#2c2c30",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.featureCardIcon}>
        <img src={icon} alt="" width={20} height={20} />
      </div>
      <h3 style={styles.featureCardTitle}>{title}</h3>
      <p style={styles.featureCardDesc}>{description}</p>
    </article>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const statCards: StatCardProps[] = [
    { label: "Calories Today",     icon: ICON_CAL,   value: "2,140", target: "Target: 3,200 kcal",   delta: "↑ 340 left" },
    { label: "Daily Steps",        icon: ICON_STEPS, value: "7,842", target: "Target: 10,000 steps",  delta: "↑ 78%" },
    { label: "Active Calories",    icon: ICON_BURN,  value: "384",   target: "Burned today",          delta: "↑ 12% vs yesterday" },
    { label: "Workouts This Week", icon: ICON_WO,    value: "3",     target: "Goal: 4 sessions" },
  ];

  const featureCards: FeatureCardProps[] = [
    {
      icon: ICON_PLAN,
      title: "Workout Planning",
      description: "Coaches build custom periodized programs tailored to your goals, equipment, and schedule.",
    },
    {
      icon: ICON_EXP,
      title: "Experts",
      description: "Browse verified coaches by specialty, rating, and price. Find your perfect fit and start in 24 hours.",
    },
    {
      icon: ICON_NUT,
      title: "Nutrition & Meal Planning",
      description: "Get personalized meal plans with macro tracking, recipe suggestions, and calorie goals.",
    },
    {
      icon: ICON_PROG,
      title: "Progress Analytics",
      description: "Track every rep, mile, and meal. Visual dashboards show exactly how you're improving.",
    },
  ];

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #111113; color: #f5f5f5; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }

        /* Hamburger spans */
        .hh-ham span {
          display: block; width: 22px; height: 2px;
          background: #f5f5f5; border-radius: 2px;
          transition: transform 0.3s ease, opacity 0.3s ease;
          transform-origin: center;
        }
        .hh-ham.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hh-ham.open span:nth-child(2) { opacity: 0; }
        .hh-ham.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Mobile menu transition */
        .hh-mobile-menu {
          max-height: 0; opacity: 0; overflow: hidden;
          transition: max-height 0.35s ease, opacity 0.35s ease, padding 0.35s ease;
          padding: 0 24px;
        }
        .hh-mobile-menu.open {
          max-height: 400px; opacity: 1; padding: 24px;
        }

        /* Responsive helpers */
        @media (max-width: 1024px) {
          .hh-desktop-nav { display: none !important; }
          .hh-ham        { display: flex !important; }
          .hh-stats      { grid-template-columns: repeat(2, 1fr) !important; }
          .hh-features   { grid-template-columns: repeat(2, 1fr) !important; }
          .hh-footer-top { flex-direction: column !important; gap: 32px !important; }
        }
        @media (max-width: 768px) {
          .hh-hero-h1      { font-size: 52px !important; letter-spacing: -1px !important; }
          .hh-stats        { grid-template-columns: 1fr !important; }
          .hh-features     { grid-template-columns: 1fr !important; }
          .hh-section-h2   { font-size: 28px !important; line-height: 38px !important; }
          .hh-footer-cols  { flex-direction: column !important; }
        }
      `}</style>

      {/* ── Navbar ── */}
      <header>
        <nav style={styles.nav} aria-label="Main navigation">
          <div style={styles.navInner}>

            {/* Logo */}
            <a href="#" style={styles.navLogo} aria-label="HeraHealth Home">
              <div style={styles.navLogoIcon}>
                <img src={LOGO_ICON} alt="HeraHealth logo mark" width={16} height={16} />
              </div>
              <span style={styles.navLogoText}>HeraHealth</span>
            </a>

            {/* Desktop center links */}
            <ul className="hh-desktop-nav" style={styles.navLinks} role="list">
              <li><a href="#features" style={styles.navLink}>Features</a></li>
              <li><a href="/auth/login"    style={styles.navLink}>Log in</a></li>
            </ul>

            {/* Desktop right actions */}
            <div className="hh-desktop-nav" style={styles.navActions}>
              <a href="/auth/login"  style={styles.btnGhost}>Log in</a>
              <a href="/auth/signup" style={styles.btnPrimary}>Start Training</a>
            </div>

            {/* Hamburger */}
            <button
              className={`hh-ham${menuOpen ? " open" : ""}`}
              style={styles.hamburger}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span /><span /><span />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <nav
          id="mobile-menu"
          className={`hh-mobile-menu${menuOpen ? " open" : ""}`}
          style={styles.mobileMenu}
          aria-label="Mobile navigation"
        >
          <a href="#features" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Features</a>
          <a href="/auth/login"    style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Log in</a>
          <a href="/auth/signup"   style={{ ...styles.btnPrimary, height: 44, padding: "0 24px", fontSize: 16 }}
             onClick={() => setMenuOpen(false)}>
            Start Training
          </a>
        </nav>
      </header>

      {/* ── Page ── */}
      <div style={styles.pageWrapper}>

        {/* ── Hero ── */}
        <section style={styles.hero} aria-labelledby="hero-heading">
          <div style={styles.heroInner}>
            <h1 className="hh-hero-h1" style={styles.heroH1} id="hero-heading">
              <span style={{ color: "#f5f5f5" }}>TRAIN WITH INTENT.</span>
              <span style={{ display: "block", color: "#ab87a3" }}>SEE THE RESULTS.</span>
            </h1>
            <p style={styles.heroSub}>
              Connect with coaches, follow specific programs, and track every metric that matters.
              HeraHealth is the all-in-one performance platform built for serious results.
            </p>
            <div style={{ marginTop: 16 }}>
              <a href="/auth/signup" style={styles.btnPrimaryLg}>
                Start Training
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── Dashboard Mockup ── */}
        <section style={styles.mockupSection} aria-label="HeraHealth dashboard preview">
          <div style={styles.mockupWindow}>
            {/* Title bar */}
            <div style={styles.mockupTitlebar} aria-hidden="true">
              <span style={{ ...styles.dot, background: "rgba(239,68,68,0.6)" }} />
              <span style={{ ...styles.dot, background: "rgba(234,179,8,0.6)" }} />
              <span style={{ ...styles.dot, background: "rgba(34,197,94,0.6)" }} />
              <span style={styles.mockupTitle}>HeraHealth Dashboard</span>
            </div>
            {/* Stats */}
            <div className="hh-stats" style={styles.statsGrid}>
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={styles.featuresSection} aria-labelledby="features-heading">
          <div style={styles.featuresHeader}>
            <h2 className="hh-section-h2" style={styles.sectionH2} id="features-heading">
              EVERYTHING YOU NEED TO REACH YOUR GOALS
            </h2>
            <p style={styles.sectionSub}>Built for the people. No fluff, just tools that work.</p>
          </div>
          <div className="hh-features" style={styles.featuresGrid}>
            {featureCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <div className="hh-footer-top" style={styles.footerTop}>
              {/* Brand */}
              <div style={styles.footerBrand}>
                <div style={styles.footerLogo}>
                  <div style={styles.footerLogoIcon}>
                    <img src={FOOTER_ICON} alt="HeraHealth" width={14} height={14} />
                  </div>
                  <span style={styles.footerLogoText}>HeraHealth</span>
                </div>
              </div>

              {/* Nav cols */}
              <nav className="hh-footer-cols" style={styles.footerCols} aria-label="Footer navigation">
                {[
                  { heading: "Product",  links: [{ label: "Features", href: "#features" }, { label: "For Coaches", href: "#" }] },
                  { heading: "Portals",  links: [{ label: "User Portal", href: "#" }, { label: "Coach Portal", href: "#" }, { label: "Admin Portal", href: "#" }] },
                  { heading: "Company",  links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Privacy", href: "#" }] },
                ].map((col) => (
                  <div key={col.heading} style={styles.footerCol}>
                    <span style={styles.footerColHeading}>{col.heading}</span>
                    <div style={styles.footerColLinks}>
                      {col.links.map((link) => (
                        <a key={link.label} href={link.href} style={styles.footerColLink}>{link.label}</a>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Copyright */}
            <div style={styles.footerBottom}>
              <p style={styles.footerCopy}>© 2026 HeraHealth. All rights reserved.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Inline Styles ────────────────────────────────────────────────────────────
// (Kept inline so the file is fully self-contained and portable)
const styles: Record<string, React.CSSProperties> = {
  // NAV
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
    background: "rgba(17,17,19,0.95)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    borderBottom: "0.6px solid rgba(44,44,48,0.5)",
    height: 64, display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 24px",
  },
  navInner: {
    width: "100%", maxWidth: 1280, display: "flex",
    alignItems: "center", justifyContent: "space-between", height: "100%",
  },
  navLogo:     { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  navLogoIcon: {
    width: 32, height: 32, background: "#915985", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  navLogoText: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
    fontSize: 20, lineHeight: "30px", letterSpacing: "1.6px", color: "#f5f5f5", whiteSpace: "nowrap",
  },
  navLinks:  { display: "flex", alignItems: "center", gap: 24, listStyle: "none" },
  navLink:   {
    fontSize: 14, lineHeight: "20px", fontWeight: 400, color: "#898994",
    transition: "color 0.2s",
  },
  navActions: { display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  btnGhost: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, lineHeight: "20px",
    borderRadius: 10, cursor: "pointer", border: "none", whiteSpace: "nowrap",
    background: "transparent", color: "#f5f5f5", height: 36, padding: "0 12px",
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, lineHeight: "20px",
    borderRadius: 10, cursor: "pointer", border: "none", whiteSpace: "nowrap",
    background: "#915985", color: "#fff", height: 36, padding: "0 12px",
  },
  hamburger: {
    display: "none", flexDirection: "column", justifyContent: "center",
    alignItems: "center", gap: 5, width: 36, height: 36,
    cursor: "pointer", background: "transparent", border: "none", padding: 0, flexShrink: 0,
  },
  mobileMenu: {
    position: "fixed", top: 64, left: 0, right: 0,
    background: "rgba(17,17,19,0.98)", borderBottom: "0.6px solid rgba(44,44,48,0.5)",
    display: "flex", flexDirection: "column", gap: 16, zIndex: 999,
  },
  mobileLink: {
    fontSize: 16, fontWeight: 500, color: "#898994",
    padding: "8px 0", borderBottom: "0.6px solid #2c2c30",
  },

  // PAGE
  pageWrapper: { paddingTop: 64 },

  // HERO
  hero: {
    background: "#111113", padding: "64px 24px 80px",
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
  },
  heroInner: {
    maxWidth: 896, width: "100%",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 22,
  },
  heroH1: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
    fontSize: 96, lineHeight: 0.95, letterSpacing: "-1.92px",
  },
  heroSub: {
    fontFamily: "'Inter', sans-serif", fontSize: 16, lineHeight: "24px",
    fontWeight: 400, color: "#898994", maxWidth: 696,
  },
  btnPrimaryLg: {
    display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
    fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, lineHeight: "24px",
    borderRadius: 10, cursor: "pointer", border: "none", whiteSpace: "nowrap",
    background: "#915985", color: "#fff", height: 48, padding: "0 32px",
  },

  // MOCKUP
  mockupSection: { padding: "0 24px 80px", display: "flex", justifyContent: "center" },
  mockupWindow: {
    background: "#1b1b1d", border: "1px solid #2c2c30",
    borderRadius: 16, overflow: "hidden", maxWidth: 1230, width: "100%",
  },
  mockupTitlebar: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "12px 16px", borderBottom: "0.6px solid #2c2c30",
  },
  dot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
  mockupTitle: { fontSize: 12, lineHeight: "16px", fontWeight: 400, color: "#898994", marginLeft: 8 },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
  },
  statCard: {
    background: "#1b1b1d", borderRight: "1px solid #2c2c30",
    padding: "24.6px", display: "flex", flexDirection: "column", gap: 12,
  },
  statCardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  statCardLabel: {
    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
    lineHeight: "20px", color: "#898994", whiteSpace: "nowrap",
  },
  statCardIcon: {
    width: 32, height: 32, background: "rgba(145,89,133,0.15)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  statCardBody:   { display: "flex", flexDirection: "column", gap: 4 },
  statCardValue: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: 30, lineHeight: "36px", letterSpacing: "-0.75px", color: "#f5f5f5",
  },
  statCardTarget: {
    fontFamily: "'Inter', sans-serif", fontSize: 12,
    lineHeight: "16px", fontWeight: 400, color: "#898994",
  },
  statCardDelta: {
    fontFamily: "'Inter', sans-serif", fontSize: 12,
    lineHeight: "16px", fontWeight: 500, color: "#4ade80",
  },

  // FEATURES
  featuresSection: { background: "#111113", padding: "80px 24px" },
  featuresHeader:  {
    textAlign: "center", marginBottom: 64,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  sectionH2: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
    fontSize: 40, lineHeight: "60px", letterSpacing: "0.4px",
    color: "#f5f5f5", textAlign: "center",
  },
  sectionSub: {
    fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: "24px",
    fontWeight: 400, color: "#898994", textAlign: "center", maxWidth: 576,
  },
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 24, maxWidth: 1280, margin: "0 auto",
  },
  featureCard: {
    background: "#1b1b1d", border: "1px solid #2c2c30",
    borderRadius: 12, padding: "24.6px",
    display: "flex", flexDirection: "column",
    transition: "border-color 0.2s",
  },
  featureCardIcon: {
    width: 40, height: 40, background: "rgba(145,89,133,0.15)",
    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginBottom: 16,
  },
  featureCardTitle: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600,
    fontSize: 16, lineHeight: "24px", letterSpacing: "0.16px",
    color: "#f5f5f5", marginBottom: 8,
  },
  featureCardDesc: {
    fontFamily: "'Inter', sans-serif", fontSize: 14,
    lineHeight: "22.75px", fontWeight: 400, color: "#898994",
  },

  // FOOTER
  footer: {
    background: "#131315", borderTop: "0.6px solid #2c2c30", padding: "48px 24px",
  },
  footerInner:    { maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 },
  footerTop:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  footerBrand:    { display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 },
  footerLogo:     { display: "flex", alignItems: "center", gap: 8 },
  footerLogoIcon: {
    width: 28, height: 28, background: "#915985", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  footerLogoText: {
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
    fontSize: 16, lineHeight: "24px", letterSpacing: "1.28px", color: "#f5f5f5",
  },
  footerCols:     { display: "flex", gap: 32 },
  footerCol:      { display: "flex", flexDirection: "column", gap: 12, minWidth: 85 },
  footerColHeading: {
    fontFamily: "'Inter', sans-serif", fontSize: 14,
    fontWeight: 500, lineHeight: "20px", color: "#f5f5f5",
  },
  footerColLinks: { display: "flex", flexDirection: "column", gap: 8 },
  footerColLink:  {
    fontFamily: "'Inter', sans-serif", fontSize: 14,
    fontWeight: 400, lineHeight: "20px", color: "#898994", transition: "color 0.2s",
  },
  footerBottom:   { borderTop: "0.6px solid #2c2c30", paddingTop: 32, textAlign: "center" },
  footerCopy:     {
    fontFamily: "'Inter', sans-serif", fontSize: 12,
    lineHeight: "16px", fontWeight: 400, color: "#898994",
  },
};