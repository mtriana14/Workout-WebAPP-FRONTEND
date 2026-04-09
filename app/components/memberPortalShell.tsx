"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { 
  Dumbbell, 
  LayoutDashboard, 
  User, 
  Target, 
  Settings, 
  Activity,
  Search
} from "lucide-react";

import { useMemberPortal } from "@/app/lib/memberPortal";

type ActivePage = "dashboard" | "profile" | "coaches";

interface MemberPortalShellProps {
  activePage: ActivePage;
  title: string;
  subtitle: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboards/user" },
  { id: "coaches", label: "Find Coaches", icon: Search, href: "/coaches" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
  { id: "goals", label: "Goals", icon: Target, href: "/dashboards/user#goals" },
  { id: "Preferences", label: "Preferences", icon: Settings, href: "/dashboards/user#preferences" },
  { id: "activity", label: "Activity", icon: Activity, href: "/dashboards/user#activity" },
] as const;

const MOBILE_LINKS = [
  { label: "Dashboard", href: "/dashboards/user" },
  { label: "Profile", href: "/profile" },
  { label: "Goals", href: "/dashboards/user#goals" },
];

export function MemberPortalShell({
  activePage,
  title,
  subtitle,
  children,
  headerActions,
}: MemberPortalShellProps) {
  const { displayName, initials, isAuthenticated, isLoading, logout, profile } = useMemberPortal();

  if (isLoading) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Loading Portal</h1>
              <p className="hh-page-subtitle">Fetching your profile and dashboard from the API.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Sign In Required</h1>
              <p className="hh-page-subtitle">
                This portal now loads from the Flask API and SQL database. Sign in first, then come back here.
              </p>
              <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
                <Link href="/auth/login" className="hh-portal-button hh-portal-button--primary">
                  Go to Login
                </Link>
                <Link href="/auth/signup" className="hh-portal-button hh-portal-button--secondary">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hh-dash-root">
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <Link href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </Link>
          <span className="hh-badge hh-badge--sm">{profile.membership}</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="User navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`hh-nav-link${
                item.id === activePage ? " hh-nav-link--active" : ""
              }`}
              aria-current={item.id === activePage ? "page" : undefined}
            >
              <item.icon size={16} style={{ flexShrink: 0, marginRight: 8 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hh-portal-profile-strip">
          <div className="hh-portal-avatar">{initials}</div>
          <div className="hh-portal-profile-meta">
            <p className="hh-portal-profile-name">{displayName}</p>
            <p className="hh-portal-profile-email">{profile.email}</p>
          </div>
          <Link href="/profile" className="hh-portal-profile-link">
            Edit
          </Link>
        </div>

        <div className="hh-sidebar__footer">
          <button type="button" className="hh-sidebar__back hh-sidebar__logout" onClick={logout}>
            Log Out
          </button>
          <Link href="/" className="hh-sidebar__back">
            ← Back to Home
          </Link>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-portal-mobilebar">
          <div className="hh-portal-mobilebar__top">
            <div>
              <p className="hh-portal-mobilebar__label">{profile.membership}</p>
              <p className="hh-portal-mobilebar__name">{displayName}</p>
            </div>
            <Link href="/profile" className="hh-portal-inline-link">
              Edit Profile
            </Link>
          </div>
          <div className="hh-portal-mobilebar__links">
            {MOBILE_LINKS.map((item) => (
              <Link key={item.label} href={item.href} className="hh-portal-chip-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hh-dash-content">
          <div className="hh-portal-header">
            <div>
              <p className="hh-portal-header__eyebrow">{profile.goal}</p>
              <h1 className="hh-page-title">{title}</h1>
              <p className="hh-page-subtitle">{subtitle}</p>
            </div>
            {headerActions ? <div className="hh-portal-header__actions">{headerActions}</div> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}