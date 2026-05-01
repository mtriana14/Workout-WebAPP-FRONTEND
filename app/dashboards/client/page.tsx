"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, MyCoach, ClientWorkoutPlan, ClientMealPlan } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell } from "lucide-react";
import { PendingRequest } from "@/types/PendingRequest";

 
export default function ClientDashboardPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [myCoach, setMyCoach] = useState<MyCoach | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<ClientWorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<ClientMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? user?.user_id;
  const displayName = user?.first_name ?? user?.firstName ?? user?.name ?? "Client";
  const hasAuth = Boolean(token && user && userId);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!hasAuth) {
      setLoading(false);
      router.replace("/auth/login");
      return;
    }

    const loadData = async () => {
      const resolvedUserId = userId as number;
      try {
        const [coachData, workoutData, mealData, pendingData] = await Promise.all([
          clientDashboardService.getMyCoach(resolvedUserId),
          clientDashboardService.getMyWorkoutPlans(resolvedUserId),
          clientDashboardService.getMyMealPlans(resolvedUserId),
          clientDashboardService.getPendingRequest(resolvedUserId),
        ]);
        setMyCoach(coachData.coach);
        setWorkoutPlans(workoutData.workout_plans);
        setMealPlans(mealData.meal_plans);
        setPendingRequest(pendingData.pending_request);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [hasAuth, hasHydrated, router, token, user, userId]);

  if (!hasHydrated) {
    return (
      <div className="hh-dash-root">
        <main className="hh-dash-main">
          <div className="hh-dash-content">
            <div className="hh-card">
              <h1 className="hh-page-title">Loading Dashboard</h1>
              <p className="hh-page-subtitle">Restoring your session.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!hasAuth) return null;

  const activePlans = workoutPlans.filter((p) => p.status === "active").length;
  const activeMeals = mealPlans.filter((p) => p.status === "active").length;

  return (
    <div className="hh-dash-root">
      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">MY DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {displayName}!</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                My Coach
              </p>
              <p style={{
                fontSize: 20,
                fontWeight: 700,
                margin: "8px 0 0",
                color: myCoach
                  ? "var(--hh-text-green)"
                  : pendingRequest
                  ? "var(--hh-accent)"
                  : "var(--hh-text-muted)"
              }}>
                {loading ? "..." : myCoach ? myCoach.name : pendingRequest ? "Pending..." : "None"}
              </p>
            </div>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Workouts
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-accent)" }}>
                {loading ? "..." : activePlans}
              </p>
            </div>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Meal Plans
              </p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>
                {loading ? "..." : activeMeals}
              </p>
            </div>
          </div>

          {/* My Coach Card */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>My Coach</h3>
              {!myCoach && !pendingRequest && (
                <a href="/dashboards/client/coaches" style={{ fontSize: 13, color: "var(--hh-accent)", textDecoration: "none", fontWeight: 500 }}>
                  Find a Coach →
                </a>
              )}
            </div>
            <div style={{ padding: 24 }}>
              {loading ? (
                <p style={{ color: "var(--hh-text-muted)" }}>Loading...</p>
              ) : myCoach ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 20 }}>
                    {myCoach.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{myCoach.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{myCoach.specialization || "Fitness Coach"}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                      Since {new Date(myCoach.since).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : pendingRequest ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--hh-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                    ⏳
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{pendingRequest.coach_name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>
                      {pendingRequest.coach_specialization || "Fitness Coach"}
                    </p>
                    <span style={{
                      display: "inline-block",
                      marginTop: 6,
                      padding: "2px 10px",
                      backgroundColor: "rgba(var(--hh-accent-rgb), 0.12)",
                      border: "1px solid var(--hh-accent)",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--hh-accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      Request Pending
                    </span>
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                      Sent {new Date(pendingRequest.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "var(--hh-text-muted)", margin: "0 0 16px" }}>You don't have a coach yet.</p>
                  <a href="/dashboards/client/coaches" style={{ display: "inline-block", padding: "12px 24px", backgroundColor: "var(--hh-accent)", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                    Find a Coach
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Recent Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Workout Plans */}
            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>🏋️ Workout Plans</h3>
                <a href="/dashboards/client/workouts" style={{ fontSize: 13, color: "var(--hh-accent)", textDecoration: "none" }}>View All →</a>
              </div>
              {workoutPlans.length === 0 ? (
                <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>No workout plans yet</p>
              ) : (
                <div>
                  {workoutPlans.slice(0, 3).map((plan) => (
                    <div key={plan.plan_id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--hh-border)" }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{plan.name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>by {plan.coach_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meal Plans */}
            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>🥗 Meal Plans</h3>
                <a href="/dashboards/client/meals" style={{ fontSize: 13, color: "var(--hh-accent)", textDecoration: "none" }}>View All →</a>
              </div>
              {mealPlans.length === 0 ? (
                <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>No meal plans yet</p>
              ) : (
                <div>
                  {mealPlans.slice(0, 3).map((plan) => (
                    <div key={plan.meal_plan_id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--hh-border)" }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{plan.name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>by {plan.coach_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}