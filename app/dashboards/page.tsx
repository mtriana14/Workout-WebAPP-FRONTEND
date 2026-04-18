"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
          </div>
        </div>
      </main>
    </div>
  );
}
