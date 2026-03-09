"use client";

import { useEffect, useState } from "react";

const LOGO_ICON = "https://www.figma.com/api/mcp/asset/4f80479e-9707-41c3-ab0e-81f454820085";
const ICON_CAL = "https://www.figma.com/api/mcp/asset/1b42fe3a-e33b-45d0-8e7d-57b32779b3d6";
const ICON_STEPS = "https://www.figma.com/api/mcp/asset/b9e32d5d-6a4f-47d2-9b37-f927bbcd022a";
const ICON_BURN = "https://www.figma.com/api/mcp/asset/5fc25fa1-e487-4c18-a6a7-233454ed969b";
const ICON_WO = "https://www.figma.com/api/mcp/asset/ac49b4fe-3ab2-4549-80f9-1aa1c4136b07";
const ICON_PLAN = "https://www.figma.com/api/mcp/asset/413a9f30-95c1-4b28-b8d7-e87af05770f9";
const ICON_EXP = "https://www.figma.com/api/mcp/asset/4a881b36-4173-415b-8f05-3c9984340b7c";
const ICON_NUT = "https://www.figma.com/api/mcp/asset/4a0462c0-a8ad-4d97-b27b-e9fa7d3dccda";
const ICON_PROG = "https://www.figma.com/api/mcp/asset/88297202-12b1-4088-8d22-2bbc924bc9bb";
const FOOTER_ICON = "https://www.figma.com/api/mcp/asset/6436eee6-7271-4db2-bb82-dde12fc6d28a";

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

function StatCard({ label, icon, value, target, delta }: StatCardProps) {
  return (
    <div className="hh-landing-stat-card">
      <div className="hh-landing-stat-card__header">
        <span className="hh-landing-stat-card__label">{label}</span>
        <div className="hh-landing-stat-card__icon">
          <img src={icon} alt="" width={16} height={16} />
        </div>
      </div>
      <div className="hh-landing-stat-card__body">
        <span className="hh-landing-stat-card__value">{value}</span>
        <span className="hh-landing-stat-card__target">{target}</span>
        {delta ? <span className="hh-landing-stat-card__delta">{delta}</span> : null}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="hh-landing-feature-card">
      <div className="hh-landing-feature-card__icon">
        <img src={icon} alt="" width={20} height={20} />
      </div>
      <h3 className="hh-landing-feature-card__title">{title}</h3>
      <p className="hh-landing-feature-card__desc">{description}</p>
    </article>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const statCards: StatCardProps[] = [
    { label: "Calories Today", icon: ICON_CAL, value: "2,140", target: "Target: 3,200 kcal", delta: "↑ 340 left" },
    { label: "Daily Steps", icon: ICON_STEPS, value: "7,842", target: "Target: 10,000 steps", delta: "↑ 78%" },
    { label: "Active Calories", icon: ICON_BURN, value: "384", target: "Burned today", delta: "↑ 12% vs yesterday" },
    { label: "Workouts This Week", icon: ICON_WO, value: "3", target: "Goal: 4 sessions" },
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
      <header>
        <nav className="hh-navbar" aria-label="Main navigation">
          <div className="hh-navbar__inner">
            <a href="#" className="hh-navbar__brand" aria-label="HeraHealth Home">
              <div className="hh-navbar__brand-icon">
                <img src={LOGO_ICON} alt="HeraHealth logo mark" width={16} height={16} />
              </div>
              <span className="hh-navbar__brand-text">HeraHealth</span>
            </a>

            <ul className="hh-navbar__links" role="list">
              <li>
                <a href="#features" className="hh-navbar__link">
                  Features
                </a>
              </li>
              <li>
                <a href="/auth/login" className="hh-navbar__link">
                  Log in
                </a>
              </li>
            </ul>

            <div className="hh-navbar__actions">
              <a href="/auth/login" className="btn btn--ghost">
                Log in
              </a>
              <a href="/auth/signup" className="btn btn--primary">
                Start Training
              </a>
            </div>

            <button
              type="button"
              className={`hh-hamburger${menuOpen ? " open" : ""}`}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        <nav
          id="mobile-menu"
          className={`hh-mobile-menu${menuOpen ? " open" : ""}`}
          aria-label="Mobile navigation"
        >
          <a href="#features" className="hh-mobile-menu__link" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="/auth/login" className="hh-mobile-menu__link" onClick={() => setMenuOpen(false)}>
            Log in
          </a>
          <a href="/auth/signup" className="btn btn--primary hh-mobile-menu__cta" onClick={() => setMenuOpen(false)}>
            Start Training
          </a>
        </nav>
      </header>

      <div className="hh-landing">
        <section className="hh-hero" aria-labelledby="hero-heading">
          <div className="hh-hero__inner">
            <h1 className="hh-hero__headline" id="hero-heading">
              <span className="hh-hero__headline-line">TRAIN WITH INTENT.</span>
              <span className="hh-hero__headline-line hh-hero__headline-line--accent">SEE THE RESULTS.</span>
            </h1>
            <p className="hh-hero__sub">
              Connect with coaches, follow specific programs, and track every metric that matters. HeraHealth is the
              all-in-one performance platform built for serious results.
            </p>
            <div className="hh-landing-hero__actions">
              <a href="/auth/signup" className="btn btn--primary-lg">
                Start Training
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className="hh-landing-mockup" aria-label="HeraHealth dashboard preview">
          <div className="hh-landing-mockup__window">
            <div className="hh-landing-mockup__titlebar" aria-hidden="true">
              <span className="hh-landing-mockup__dot hh-landing-mockup__dot--red" />
              <span className="hh-landing-mockup__dot hh-landing-mockup__dot--yellow" />
              <span className="hh-landing-mockup__dot hh-landing-mockup__dot--green" />
              <span className="hh-landing-mockup__title">HeraHealth Dashboard</span>
            </div>

            <div className="hh-landing-stats-grid">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="hh-landing-features" aria-labelledby="features-heading">
          <div className="hh-landing-features__header">
            <h2 className="hh-landing-features__title" id="features-heading">
              EVERYTHING YOU NEED TO REACH YOUR GOALS
            </h2>
            <p className="hh-landing-features__sub">Built for the people. No fluff, just tools that work.</p>
          </div>

          <div className="hh-features-grid">
            {featureCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <footer className="hh-landing-footer">
          <div className="hh-landing-footer__inner">
            <div className="hh-landing-footer__top">
              <div className="hh-landing-footer__brand">
                <div className="hh-landing-footer__logo">
                  <div className="hh-landing-footer__logo-icon">
                    <img src={FOOTER_ICON} alt="HeraHealth" width={14} height={14} />
                  </div>
                  <span className="hh-landing-footer__logo-text">HeraHealth</span>
                </div>
              </div>

              <nav className="hh-landing-footer__cols" aria-label="Footer navigation">
                {[
                  { heading: "Product", links: [{ label: "Features", href: "#features" }, { label: "For Coaches", href: "#" }] },
                  {
                    heading: "Portals",
                    links: [
                      { label: "User Portal", href: "#" },
                      { label: "Coach Portal", href: "#" },
                      { label: "Admin Portal", href: "#" },
                    ],
                  },
                  { heading: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Privacy", href: "#" }] },
                ].map((column) => (
                  <div key={column.heading} className="hh-landing-footer__col">
                    <span className="hh-landing-footer__col-heading">{column.heading}</span>
                    <div className="hh-landing-footer__col-links">
                      {column.links.map((link) => (
                        <a key={link.label} href={link.href} className="hh-landing-footer__col-link">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            <div className="hh-landing-footer__bottom">
              <p className="hh-landing-footer__copy">© 2026 HeraHealth. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
