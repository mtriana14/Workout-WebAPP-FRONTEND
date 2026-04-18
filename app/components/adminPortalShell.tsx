"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  Briefcase,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Users,
} from "lucide-react";

import { SignOutButton } from "@/app/components/signOutButton";
import { getDashboardRouteForRole } from "@/app/lib/api";
import { useMemberPortal } from "@/app/lib/memberPortal";

type AdminPage = "dashboard" | "users" | "coaches" | "exercises" | "payments" | "notifications";

interface AdminPortalShellProps {
  activePage: AdminPage;
  title: string;
  subtitle: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboards/admin" },
  { id: "users", label: "Users", icon: Users, href: "/admin/users" },
  { id: "coaches", label: "Coaches", icon: Briefcase, href: "/admin/coaches" },
  { id: "exercises", label: "Exercise DB", icon: Activity, href: "/admin/exercises" },
  { id: "payments", label: "Payment", icon: CreditCard, href: "/admin/payments" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/admin/notifications" },
] as const;

export function AdminPortalShell({
  activePage,
  title,
  subtitle,
  children,
  headerActions,
}: AdminPortalShellProps) {
  const { displayName, isAuthenticated, isLoading, userRole } = useMemberPortal();

  if (isLoading) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Loading Admin Portal</h1>
              <p className="hh-page-subtitle">Checking your signed-in account and admin access.</p>
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
              <h1 className="hh-page-title">Admin Sign-In Required</h1>
              <p className="hh-page-subtitle">Sign in with an admin account to manage the platform.</p>
              <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
                <Link href="/auth/login" className="hh-portal-button hh-portal-button--primary">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Admin Access Only</h1>
              <p className="hh-page-subtitle">
                You are signed in as {displayName} with the `{userRole}` role.
              </p>
              <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
                <Link
                  href={getDashboardRouteForRole(userRole)}
                  className="hh-portal-button hh-portal-button--primary"
                >
                  Open My Dashboard
                </Link>
                <SignOutButton className="hh-portal-button hh-portal-button--secondary" />
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
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`hh-nav-link${item.id === activePage ? " hh-nav-link--active" : ""}`}
              aria-current={item.id === activePage ? "page" : undefined}
            >
              <item.icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          ))}
        </nav>

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
        <div className="hh-dash-content">
          <div className="hh-portal-header">
            <div>
              <p className="hh-portal-header__eyebrow">Signed in as {displayName}</p>
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
