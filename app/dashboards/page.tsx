"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SignOutButton } from "@/app/components/signOutButton";
import { getDashboardRouteForRole, getStoredAuthSession } from "@/app/lib/api";
import { ROLE_REDIRECTS } from "@/router/router";
import { useAuthStore } from "@/store/authStore";

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

export default function DashboardsPage() {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);

  useEffect(() => {
    const role = userRole ?? readPersistedRole();
    if (!role) {
      router.replace("/auth/login");
      return;
    }

    router.replace(ROLE_REDIRECTS[role] ?? getDashboardRouteForRole(role));
  }, [router, userRole]);

  return (
    <div className="hh-dash-root">
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div className="hh-card">
            <h1 className="hh-page-title">Loading Dashboard</h1>
            <p className="hh-page-subtitle">Routing you to the correct portal.</p>
            <div className="hh-portal-header__actions" style={{ marginTop: 16 }}>
              <SignOutButton className="hh-portal-button hh-portal-button--secondary">
                Sign Out
              </SignOutButton>
              <Link href="/" className="hh-portal-button hh-portal-button--primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
