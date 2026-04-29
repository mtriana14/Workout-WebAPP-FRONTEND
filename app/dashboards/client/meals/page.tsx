"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, ClientMealPlan } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "rgba(34, 197, 94, 0.1)", color: "var(--hh-text-green)" },
  inactive: { bg: "rgba(156, 163, 175, 0.1)", color: "var(--hh-text-muted)" },
  completed: { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
};

export default function MyMealsPage() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<ClientMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<ClientMealPlan | null>(null);

  const userId = user?.id ?? user?.user_id;

  useEffect(() => {
    const loadPlans = async () => {
      if (!userId) return;
      try {
        const data = await clientDashboardService.getMyMealPlans(userId);
        setPlans(data.meal_plans);
      } catch (err) {
        console.error("Failed to load meal plans", err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [userId]);

  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);

  const counts = {
    all: plans.length,
    active: plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="hh-dash-root">
      {/* Plan Detail Modal */}
      {selectedPlan && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setSelectedPlan(null)}>
          <div className="hh-card" style={{ width: 500, padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--hh-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>🥗 {selectedPlan.name}</h2>
                  <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--hh-text-muted)" }}>by {selectedPlan.coach_name}</p>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[selectedPlan.status].bg, color: STATUS_STYLES[selectedPlan.status].color }}>
                  {selectedPlan.status}
                </span>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {selectedPlan.description ? (
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{selectedPlan.description}</p>
              ) : (
                <p style={{ margin: 0, fontSize: 14, color: "var(--hh-text-muted)", fontStyle: "italic" }}>No description provided</p>
              )}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--hh-border)" }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)" }}>
                  Created: {new Date(selectedPlan.created_at).toLocaleDateString()}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                  Last updated: {new Date(selectedPlan.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedPlan(null)} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}

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
            <h1 className="hh-page-title">MY MEAL PLANS</h1>
            <p className="hh-page-subtitle">View your nutrition plans from your coach</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Total Plans", value: counts.all, color: "var(--hh-text-primary)", key: "all" },
              { label: "Active", value: counts.active, color: "var(--hh-text-green)", key: "active" },
              { label: "Completed", value: counts.completed, color: "#3b82f6", key: "completed" },
            ].map((stat) => (
              <div key={stat.label} onClick={() => setFilter(stat.key)} className="hh-card" style={{ padding: 20, textAlign: "center", cursor: "pointer", border: filter === stat.key ? `2px solid ${stat.color}` : "2px solid transparent" }}>
                <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Plans List */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {filter === "all" ? "All Meal Plans" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Plans`}
              </h3>
            </div>

            {loading ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading...</p>
            ) : filtered.length === 0 ? (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>
                {plans.length === 0 ? "No meal plans yet. Connect with a coach to get started!" : "No plans match this filter."}
              </p>
            ) : (
              <div>
                {filtered.map((plan) => (
                  <div key={plan.meal_plan_id} onClick={() => setSelectedPlan(plan)} style={{ padding: 20, borderBottom: "1px solid var(--hh-border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{plan.name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>by {plan.coach_name}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[plan.status].bg, color: STATUS_STYLES[plan.status].color }}>
                        {plan.status}
                      </span>
                      <span style={{ color: "var(--hh-text-muted)" }}>→</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
