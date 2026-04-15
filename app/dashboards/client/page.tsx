"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, MyCoach, ClientWorkoutPlan, ClientMealPlan } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const [myCoach, setMyCoach] = useState<MyCoach | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<ClientWorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<ClientMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.user_id;

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      try {
        const [coachData, workoutData, mealData] = await Promise.all([
          clientDashboardService.getMyCoach(userId),
          clientDashboardService.getMyWorkoutPlans(userId),
          clientDashboardService.getMyMealPlans(userId),
        ]);
        setMyCoach(coachData.coach);
        setWorkoutPlans(workoutData.workout_plans);
        setMealPlans(mealData.meal_plans);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  const activePlans = workoutPlans.filter((p) => p.status === "active").length;
  const activeMeals = mealPlans.filter((p) => p.status === "active").length;

  return (
    <div className="hh-dash-root">
      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">MY DASHBOARD</h1>
            <p className="hh-page-subtitle">Welcome back, {user?.first_name || "Client"}!</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                My Coach
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 0", color: myCoach ? "var(--hh-text-green)" : "var(--hh-text-muted)" }}>
                {loading ? "..." : myCoach ? myCoach.name : "None"}
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
              {!myCoach && (
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