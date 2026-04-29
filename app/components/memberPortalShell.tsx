"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Dumbbell } from "lucide-react";

import { SignOutButton } from "@/app/components/signOutButton";
import { useMemberPortal } from "@/app/lib/memberPortal";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_CLIENT } from "@/router/router";

type ActivePage =
  | "dashboard"
  | "profile"
  | "coaches"
  | "settings"
  | "activity"
  | "chat"
  | "billing"
  | "nutrition"
  | "calendar"
  | "progressPhotos"
  | "invoices"
  | "reviews";

interface MemberPortalShellProps {
  activePage: ActivePage;
  title: string;
  subtitle: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

const MOBILE_LINKS = [
  { label: "Dashboard", href: "/dashboards/client" },
  { label: "Progress Photos", href: "/dashboards/client/progress/photos" },
  { label: "Invoices", href: "/my-invoices" },
];

export function MemberPortalShell({
  activePage: _activePage,
  title,
  subtitle,
  children,
  headerActions,
}: MemberPortalShellProps) {
  const { displayName, isAuthenticated, isLoading, profile } = useMemberPortal();

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
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <Link href="/" className="hh-sidebar__back">
            ← Back to Home
          </Link>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-portal-mobilebar">
          <div className="hh-portal-mobilebar__top">
            <div>
              <p className="hh-portal-mobilebar__label">Client Portal</p>
              <p className="hh-portal-mobilebar__name">{displayName}</p>
            </div>
            <Link href="/dashboards/user/profile" className="hh-portal-inline-link">
              Edit Photo
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
