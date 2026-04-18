"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Award,
  ClipboardList,
  Dumbbell,
  Flame,
  Footprints,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from "lucide-react";

import { getDashboardRouteForRole, getStoredAuthSession } from "@/app/lib/api";
import { ROLE_REDIRECTS } from "@/router/router";

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

const STAT_CARDS: StatCardProps[] = [
  { label: "Calories Today", icon: Flame, value: "2,140", target: "Target: 3,200 kcal", delta: "340 left" },
  { label: "Daily Steps", icon: Footprints, value: "7,842", target: "Target: 10,000 steps", delta: "78% complete" },
  { label: "Active Calories", icon: Activity, value: "384", target: "Burned today", delta: "12% vs yesterday" },
  { label: "Workouts This Week", icon: Dumbbell, value: "3", target: "Goal: 4 sessions" },
];

const FEATURE_CARDS: FeatureCardProps[] = [
  {
    icon: ClipboardList,
    title: "Workout Planning",
    description: "Coaches build structured programs around your goals, schedule, and equipment.",
  },
  {
    icon: Award,
    title: "Coach Matching",
    description: "Browse verified coaches by specialty, price, and availability to find the right fit.",
  },
  {
    icon: Utensils,
    title: "Nutrition Support",
    description: "Track meals, follow macro targets, and stay aligned with your plan.",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "See trends across workouts, meals, and daily activity in one place.",
  },
];

function readPersistedRole() {
  const legacyRole = getStoredAuthSession()?.user?.role;
  if (legacyRole) {
    return legacyRole;
  }

  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawAuth = window.localStorage.getItem("auth");
    if (!rawAuth) {
      return null;
    }

    const parsed = JSON.parse(rawAuth) as { state?: { user?: { role?: string } } };
    return parsed.state?.user?.role ?? null;
  } catch {
    return null;
  }
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
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const dashboardHref = currentRole
    ? ROLE_REDIRECTS[currentRole] ?? getDashboardRouteForRole(currentRole)
    : "/dashboards";

  useEffect(() => {
    setCurrentRole(readPersistedRole());

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <header>
        <nav className="hh-navbar" aria-label="Main navigation">
          <div className="hh-navbar__inner">
            <a href="/" className="hh-navbar__brand" aria-label="HeraHealth Home">
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
                <a href={currentRole ? dashboardHref : "/auth/login"} className="hh-navbar__link">
                  {currentRole ? "My Dashboard" : "Log in"}
                </a>
              </li>
            </ul>

            <div className="hh-navbar__actions">
              <a href={currentRole ? "/" : "/auth/login"} className="btn btn--ghost">
                {currentRole ? "Home" : "Log in"}
              </a>
              <a href={currentRole ? dashboardHref : "/auth/signup"} className="btn btn--primary">
                {currentRole ? "My Dashboard" : "Start Training"}
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
          <a
            href={currentRole ? dashboardHref : "/auth/login"}
            className="hh-mobile-menu__link"
            onClick={() => setMenuOpen(false)}
          >
            {currentRole ? "My Dashboard" : "Log in"}
          </a>
          <a
            href={currentRole ? "/" : "/auth/signup"}
            className="btn btn--primary hh-mobile-menu__cta"
            onClick={() => setMenuOpen(false)}
          >
            {currentRole ? "Home" : "Start Training"}
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
              Connect with coaches, follow structured programs, and track every metric that matters in one place.
            </p>
            <div className="hh-landing-hero__actions">
              <a href={currentRole ? dashboardHref : "/auth/signup"} className="btn btn--primary-lg">
                {currentRole ? "Open My Dashboard" : "Start Training"}
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
              {STAT_CARDS.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="hh-landing-features" aria-labelledby="features-heading">
          <div className="hh-landing-features__header">
            <h2 className="hh-landing-features__title" id="features-heading">
              EVERYTHING YOU NEED TO STAY ON PLAN
            </h2>
            <p className="hh-landing-features__sub">Straightforward tools for clients, coaches, and admins.</p>
          </div>

          <div className="hh-features-grid">
            {FEATURE_CARDS.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
