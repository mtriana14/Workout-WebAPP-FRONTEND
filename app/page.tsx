"use client";

import { useEffect, useState } from "react";
import {
  Award,
  ClipboardList,
  Dumbbell,
  TrendingUp,
  Utensils,
  Users,
  Star,
  type LucideIcon,
} from "lucide-react";

import { getDashboardRouteForRole, getStoredAuthSession, fetchPublicStats, fetchPublicExercises, type PublicStats, type PublicExercise } from "@/app/lib/api";
import { ROLE_REDIRECTS } from "@/router/router";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

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
  if (legacyRole) return legacyRole;
  if (typeof window === "undefined") return null;
  try {
    const rawAuth = window.localStorage.getItem("auth");
    if (!rawAuth) return null;
    const parsed = JSON.parse(rawAuth) as { state?: { user?: { role?: string } } };
    return parsed.state?.user?.role ?? null;
  } catch {
    return null;
  }
}

function StatPill({ value, label, icon: Icon }: { value: number | undefined; label: string; icon: LucideIcon }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 32px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
        <Icon size={22} color="var(--hh-accent)" />
      </div>
      <p style={{ fontSize: 36, fontWeight: 800, margin: 0, color: "var(--hh-text-primary)", letterSpacing: "-1px" }}>
        {value !== undefined ? value.toLocaleString() : "—"}
      </p>
      <p style={{ fontSize: 13, color: "var(--hh-text-muted)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </p>
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= Math.round(rating) ? "var(--hh-accent)" : "none"}
          color={n <= Math.round(rating) ? "var(--hh-accent)" : "var(--hh-border)"}
        />
      ))}
      <span style={{ fontSize: 12, color: "var(--hh-text-muted)", marginLeft: 6 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ coach_name, avg_rating, review_count, top_comment, reviewer_name }: PublicStats["top_coaches"][number]) {
  return (
    <article style={{
      background: "var(--hh-bg-card)",
      border: "1px solid var(--hh-border)",
      borderRadius: 12,
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
    }}>
      <StarRow rating={avg_rating} />
      <p style={{ fontSize: 14, color: "var(--hh-text-primary)", lineHeight: 1.6, flex: 1, margin: "0 0 16px", fontStyle: top_comment ? "italic" : "normal", opacity: top_comment ? 1 : 0.5 }}>
        {top_comment ? `"${top_comment}"` : "No comment yet."}
      </p>
      <div style={{ borderTop: "1px solid var(--hh-border)", paddingTop: 12 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--hh-text-primary)" }}>
          Coach {coach_name}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
          {review_count} review{review_count !== 1 ? "s" : ""}
          {reviewer_name ? ` · reviewed by ${reviewer_name}` : ""}
        </p>
      </div>
    </article>
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
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [exercises, setExercises] = useState<PublicExercise[]>([]);
  const [muscleFilter, setMuscleFilter] = useState<string>("All");

  const dashboardHref = currentRole
    ? ROLE_REDIRECTS[currentRole] ?? getDashboardRouteForRole(currentRole)
    : "/dashboards";

  useEffect(() => {
    setCurrentRole(readPersistedRole());

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);

    fetchPublicStats().then(setStats).catch(() => {});
    fetchPublicExercises().then((d) => setExercises(d.exercises ?? [])).catch(() => {});

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
                <a href="#features" className="hh-navbar__link">Features</a>
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

        <nav id="mobile-menu" className={`hh-mobile-menu${menuOpen ? " open" : ""}`} aria-label="Mobile navigation">
          <a href="#features" className="hh-mobile-menu__link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href={currentRole ? dashboardHref : "/auth/login"} className="hh-mobile-menu__link" onClick={() => setMenuOpen(false)}>
            {currentRole ? "My Dashboard" : "Log in"}
          </a>
          <a href={currentRole ? "/" : "/auth/signup"} className="btn btn--primary hh-mobile-menu__cta" onClick={() => setMenuOpen(false)}>
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

        {/* ── Platform stats ── */}
        <section aria-label="Platform statistics" style={{ padding: "0 24px 64px" }}>
          <div style={{
            maxWidth: 800,
            margin: "0 auto",
            background: "var(--hh-bg-card)",
            border: "1px solid var(--hh-border)",
            borderRadius: 16,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            overflow: "hidden",
          }}>
            {[
              { label: "Members", key: "total_members" as const, icon: Users },
              { label: "Active Coaches", key: "active_coaches" as const, icon: Award },
              { label: "Reviews", key: "total_reviews" as const, icon: Star },
            ].map(({ label, key, icon }, idx) => (
              <div key={label} style={{ borderLeft: idx > 0 ? "1px solid var(--hh-border)" : "none" }}>
                <StatPill label={label} value={stats?.[key]} icon={icon} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Top coach reviews ── */}
        {stats && stats.top_coaches.length > 0 && (
          <section aria-labelledby="reviews-heading" style={{ padding: "0 24px 80px" }}>
            <div style={{ maxWidth: 960, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 36 }}>
                <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }} id="reviews-heading">
                  Top-Rated Coaches
                </h2>
                <p style={{ color: "var(--hh-text-muted)", fontSize: 14, marginTop: 8 }}>
                  Hear from members who found their coach on HeraHealth
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {stats.top_coaches.map((coach) => (
                  <ReviewCard key={coach.coach_name} {...coach} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Exercise library ── */}
        {exercises.length > 0 && (() => {
          const muscleGroups = ["All", ...Array.from(new Set(exercises.map((e) => e.muscle_group ?? "Other").filter(Boolean))).sort()];
          const filtered = muscleFilter === "All" ? exercises : exercises.filter((e) => (e.muscle_group ?? "Other") === muscleFilter);
          return (
            <section aria-labelledby="exercises-heading" style={{ padding: "0 24px 80px" }}>
              <div style={{ maxWidth: 960, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }} id="exercises-heading">
                    Exercise Library
                  </h2>
                  <p style={{ color: "var(--hh-text-muted)", fontSize: 14, marginTop: 8 }}>
                    {exercises.length} exercises across {muscleGroups.length - 1} muscle groups
                  </p>
                </div>

                {/* Muscle group filter pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
                  {muscleGroups.map((mg) => (
                    <button
                      key={mg}
                      onClick={() => setMuscleFilter(mg)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor: muscleFilter === mg ? "var(--hh-accent)" : "var(--hh-border)",
                        background: muscleFilter === mg ? "var(--hh-accent)" : "transparent",
                        color: muscleFilter === mg ? "#fff" : "var(--hh-text-muted)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {mg}
                    </button>
                  ))}
                </div>

                {/* Exercise grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {filtered.map((ex) => (
                    <div
                      key={ex.id}
                      style={{
                        background: "var(--hh-bg-card)",
                        border: "1px solid var(--hh-border)",
                        borderRadius: 10,
                        padding: "14px 16px",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--hh-text-primary)" }}>
                        {ex.name}
                      </p>
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        {ex.muscle_group && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(192,132,252,0.12)", color: "#c084fc", fontWeight: 500 }}>
                            {ex.muscle_group}
                          </span>
                        )}
                        {ex.difficulty && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--hh-bg-card-dark)", color: "var(--hh-text-muted)", fontWeight: 500 }}>
                            {ex.difficulty}
                          </span>
                        )}
                      </div>
                      {ex.equipment_type && (
                        <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--hh-text-muted)" }}>
                          {ex.equipment_type}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

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
