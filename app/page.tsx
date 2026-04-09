"use client";

import { useEffect, useState } from "react";
import { getStoredAuthSession, getDashboardRouteForRole } from "@/app/lib/api";
import { 
  Dumbbell, 
  Flame, 
  Footprints, 
  Activity, 
  ClipboardList, 
  Award, 
  Utensils, 
  TrendingUp,
  type LucideIcon
} from "lucide-react";

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  value: string;
  target: string;
  delta?: string;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function StatCard({ label, icon: Icon, value, target, delta }: StatCardProps) {
  return (
    <div className="hh-landing-stat-card">
      <div className="hh-landing-stat-card__header">
        <span className="hh-landing-stat-card__label">{label}</span>
        <div className="hh-landing-stat-card__icon">
          <Icon size={16} />
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

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="hh-landing-feature-card">
      <div className="hh-landing-feature-card__icon">
        <Icon size={20} />
      </div>
      <h3 className="hh-landing-feature-card__title">{title}</h3>
      <p className="hh-landing-feature-card__desc">{description}</p>
    </article>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // 1. ADDED REDIRECT LOGIC: Check if user is logged in and bounce them to their dashboard
    const session = getStoredAuthSession();
    if (session?.token && session?.user?.role) {
      window.location.assign(getDashboardRouteForRole(session.user.role));
      return; 
    }

    // 2. Existing escape key logic
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const statCards: StatCardProps[] = [
    { label: "Calories Today", icon: Flame, value: "2,140", target: "Target: 3,200 kcal", delta: "↑ 340 left" },
    { label: "Daily Steps", icon: Footprints, value: "7,842", target: "Target: 10,000 steps", delta: "↑ 78%" },
    { label: "Active Calories", icon: Activity, value: "384", target: "Burned today", delta: "↑ 12% vs yesterday" },
    { label: "Workouts This Week", icon: Dumbbell, value: "3", target: "Goal: 4 sessions" },
  ];

  const featureCards: FeatureCardProps[] = [
    {
      icon: ClipboardList,
      title: "Workout Planning",
      description: "Coaches build custom periodized programs tailored to your goals, equipment, and schedule.",
    },
    {
      icon: Award,
      title: "Experts",
      description: "Browse verified coaches by specialty, rating, and price. Find your perfect fit and start in 24 hours.",
    },
    {
      icon: Utensils,
      title: "Nutrition & Meal Planning",
      description: "Get personalized meal plans with macro tracking, recipe suggestions, and calorie goals.",
    },
    {
      icon: TrendingUp,
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
                <Dumbbell size={16} />
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
                    <Dumbbell size={14} />
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