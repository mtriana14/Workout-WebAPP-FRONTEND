"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, ClientMealPlan } from "@/services/clientDashboardService";
import { useAuthStore } from "@/store/authStore";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = typeof MEAL_TYPES[number];

type Meal = { name: string; calories: number; protein: number; carbs: number; fat: number };
type DayPlan = { breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null; snack: Meal | null };
type WeekPlan = Record<string, DayPlan>;

const EMPTY_WEEK: WeekPlan = Object.fromEntries(
  DAYS.map((d) => [d, { breakfast: null, lunch: null, dinner: null, snack: null }])
);

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active:    { bg: "rgba(34, 197, 94, 0.1)",   color: "var(--hh-text-green)" },
  inactive:  { bg: "rgba(156, 163, 175, 0.1)", color: "var(--hh-text-muted)" },
  completed: { bg: "rgba(59, 130, 246, 0.1)",  color: "#3b82f6" },
};

function parseWeekPlanFromDescription(description: string | null): WeekPlan | null {
  if (!description) return null;
  const lines = description.split("\n").map((l) => l.trim()).filter(Boolean);
  const week: WeekPlan = { ...EMPTY_WEEK };
  let found = false;

  for (const line of lines) {
    const dayMatch = DAYS.find((d) => line.startsWith(d + ":"));
    if (!dayMatch) continue;
    found = true;
    const rest = line.slice(dayMatch.length + 1).trim();
    const slots: DayPlan = { breakfast: null, lunch: null, dinner: null, snack: null };

    for (const mealType of MEAL_TYPES) {
      const re = new RegExp(`${mealType}:\\s*([^;]+)`, "i");
      const m = rest.match(re);
      if (!m) continue;
      const part = m[1].trim();
      const nameMatch = part.match(/^(.+?)\s*\(/);
      const calMatch  = part.match(/(\d+)\s*cal/i);
      const pMatch    = part.match(/P(\d+)/i);
      const cMatch    = part.match(/C(\d+)/i);
      const fMatch    = part.match(/F(\d+)/i);
      slots[mealType] = {
        name:     nameMatch?.[1]?.trim() ?? part,
        calories: calMatch  ? Number(calMatch[1])  : 0,
        protein:  pMatch    ? Number(pMatch[1])    : 0,
        carbs:    cMatch    ? Number(cMatch[1])    : 0,
        fat:      fMatch    ? Number(fMatch[1])    : 0,
      };
    }
    week[dayMatch] = slots;
  }
  return found ? week : null;
}

function buildDescription(plan: WeekPlan): string {
  const lines = DAYS.map((day) => {
    const meals = MEAL_TYPES
      .map((t) => {
        const m = plan[day][t];
        return m ? `${t}: ${m.name} (${m.calories} cal, P${m.protein}/C${m.carbs}/F${m.fat})` : null;
      })
      .filter(Boolean);
    return `${day}: ${meals.length ? meals.join("; ") : "No meals assigned"}`;
  });
  return lines.join("\n");
}

export default function MyMealsPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  const [plans, setPlans] = useState<ClientMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState<ClientMealPlan | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Detail modal day selector
  const [detailDay, setDetailDay] = useState("Monday");

  // Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [planName, setPlanName] = useState("My Nutrition Plan");
  const [weekPlan, setWeekPlan] = useState<WeekPlan>(EMPTY_WEEK);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [editingMeal, setEditingMeal] = useState<{ mealType: MealType; meal: Meal } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    clientDashboardService.getMyMealPlans(Number(userId))
      .then((d) => setPlans(d.meal_plans))
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = filter === "all" ? plans : plans.filter((p) => p.status === filter);
  const counts = {
    all:       plans.length,
    active:    plans.filter((p) => p.status === "active").length,
    completed: plans.filter((p) => p.status === "completed").length,
  };

  const dayPlan = weekPlan[selectedDay];

  const totalCalories = MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.calories ?? 0), 0);
  const totalProtein  = MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.protein  ?? 0), 0);
  const totalCarbs    = MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.carbs    ?? 0), 0);
  const totalFat      = MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.fat      ?? 0), 0);

  const handleSaveMeal = () => {
    if (!editingMeal) return;
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], [editingMeal.mealType]: editingMeal.meal },
    }));
    setEditingMeal(null);
  };

  const handleRemoveMeal = (mealType: MealType) => {
    setWeekPlan((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], [mealType]: null },
    }));
  };

  const handleSavePlan = () => {
    if (!userId)          { setStatusMessage("Sign in before creating a plan."); return; }
    if (!planName.trim()) { setStatusMessage("Plan name is required."); return; }

    setIsSaving(true);
    const plan = clientDashboardService.createMyMealPlan(Number(userId), {
      name: planName.trim(),
      description: buildDescription(weekPlan),
      status: "active",
    });
    setPlans((prev) => [plan, ...prev]);
    setPlanName("My Nutrition Plan");
    setWeekPlan(EMPTY_WEEK);
    setShowBuilder(false);
    setStatusMessage("Meal plan created.");
    setIsSaving(false);
  };

  const updateLocalStatus = (plan: ClientMealPlan, status: ClientMealPlan["status"]) => {
    if (!userId || plan.source !== "client") return;
    const updated = clientDashboardService.updateMyMealPlan(Number(userId), plan.meal_plan_id, { status });
    if (!updated) return;
    setPlans((prev) => prev.map((p) => p.meal_plan_id === updated.meal_plan_id ? updated : p));
    setSelectedPlan(updated);
  };

  const deleteLocalPlan = (plan: ClientMealPlan) => {
    if (!userId || plan.source !== "client") return;
    clientDashboardService.deleteMyMealPlan(Number(userId), plan.meal_plan_id);
    setPlans((prev) => prev.filter((p) => p.meal_plan_id !== plan.meal_plan_id));
    setSelectedPlan(null);
    setStatusMessage("Plan deleted.");
  };

  return (
    <div className="hh-dash-root">
      {/* Plan detail modal */}
      {selectedPlan && (() => {
        const parsedWeek = parseWeekPlanFromDescription(selectedPlan.description);
        const dp = parsedWeek?.[detailDay];
        const detailCals = dp ? MEAL_TYPES.reduce((s, t) => s + (dp[t]?.calories ?? 0), 0) : 0;

        return (
          <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
            onClick={() => setSelectedPlan(null)}>
            <div className="hh-card" style={{ width: 640, maxHeight: "85vh", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: 24, borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>🥗 {selectedPlan.name}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>by {selectedPlan.coach_name}</p>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[selectedPlan.status]?.bg, color: STATUS_STYLES[selectedPlan.status]?.color }}>
                  {selectedPlan.status}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                {parsedWeek ? (
                  <>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                      {DAYS.map((d) => (
                        <button key={d} onClick={() => setDetailDay(d)} style={{
                          padding: "5px 12px", borderRadius: "var(--hh-radius-full)", fontSize: 12, fontWeight: 500,
                          border: "1px solid", cursor: "pointer",
                          borderColor: detailDay === d ? "var(--hh-accent)" : "var(--hh-border)",
                          background: detailDay === d ? "var(--hh-accent-20)" : "transparent",
                          color: detailDay === d ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                        }}>{d.slice(0, 3)}</button>
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {MEAL_TYPES.map((t) => {
                          const meal = dp?.[t] ?? null;
                          return (
                            <div key={t} className="hh-card" style={{ padding: 14 }}>
                              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, textTransform: "capitalize", color: "var(--hh-text-muted)" }}>{t}</p>
                              {meal ? (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: 14, fontWeight: 500 }}>{meal.name}</span>
                                  <div style={{ display: "flex", gap: 10 }}>
                                    {[{ l: "Cal", v: meal.calories }, { l: "P", v: `${meal.protein}g` }, { l: "C", v: `${meal.carbs}g` }, { l: "F", v: `${meal.fat}g` }].map((m) => (
                                      <div key={m.l} style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.v}</div>
                                        <div style={{ fontSize: 10, color: "var(--hh-text-muted)" }}>{m.l}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-muted)" }}>No meal assigned</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="hh-card" style={{ padding: 16, alignSelf: "start" }}>
                        <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 600 }}>{detailDay} Summary</p>
                        <div style={{ textAlign: "center", marginBottom: 12 }}>
                          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--hh-accent-light)" }}>{detailCals}</div>
                          <div style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>calories</div>
                        </div>
                        {[
                          { label: "Protein", val: `${dp ? MEAL_TYPES.reduce((s, t) => s + (dp[t]?.protein ?? 0), 0) : 0}g`, color: "var(--hh-accent)" },
                          { label: "Carbs",   val: `${dp ? MEAL_TYPES.reduce((s, t) => s + (dp[t]?.carbs   ?? 0), 0) : 0}g`, color: "var(--hh-accent-light)" },
                          { label: "Fat",     val: `${dp ? MEAL_TYPES.reduce((s, t) => s + (dp[t]?.fat     ?? 0), 0) : 0}g`, color: "#f59e0b" },
                        ].map((m) => (
                          <div key={m.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "var(--hh-text-muted)" }}>{m.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : selectedPlan.description ? (
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selectedPlan.description}</p>
                ) : (
                  <p style={{ fontSize: 14, color: "var(--hh-text-muted)", fontStyle: "italic" }}>No meal details provided</p>
                )}
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", gap: 12 }}>
                {selectedPlan.source === "client" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateLocalStatus(selectedPlan, selectedPlan.status === "completed" ? "active" : "completed")} className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)" }}>
                      {selectedPlan.status === "completed" ? "Mark Active" : "Mark Completed"}
                    </button>
                    <button onClick={() => deleteLocalPlan(selectedPlan)} className="btn btn--ghost" style={{ border: "1px solid var(--hh-border)", color: "var(--hh-error)" }}>Delete</button>
                  </div>
                ) : <span />}
                <button onClick={() => setSelectedPlan(null)} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit meal modal (builder) */}
      {editingMeal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setEditingMeal(null)}>
          <div className="hh-card" style={{ width: "100%", maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 600, textTransform: "capitalize", marginBottom: 16 }}>{editingMeal.mealType}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="hh-field">
                <label className="hh-field__label">Meal Name</label>
                <div className="hh-input-wrap">
                  <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    placeholder="e.g. Grilled chicken salad"
                    value={editingMeal.meal.name}
                    onChange={(e) => setEditingMeal({ ...editingMeal, meal: { ...editingMeal.meal, name: e.target.value } })} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                  <div key={field} className="hh-field">
                    <label className="hh-field__label" style={{ textTransform: "capitalize" }}>
                      {field}{field !== "calories" ? " (g)" : ""}
                    </label>
                    <div className="hh-input-wrap">
                      <input type="number" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={editingMeal.meal[field]}
                        onChange={(e) => setEditingMeal({ ...editingMeal, meal: { ...editingMeal.meal, [field]: Number(e.target.value) } })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn btn--ghost" style={{ flex: 1, border: "1px solid var(--hh-border)" }} onClick={() => setEditingMeal(null)}>Cancel</button>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSaveMeal}>Save Meal</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md"><Dumbbell size={16} color="white" /></div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Client Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_CLIENT} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">Sign Out</SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="hh-page-title">MY MEAL PLANS</h1>
              <p className="hh-page-subtitle">View nutrition plans from your coach or create your own</p>
            </div>
            <button className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowBuilder((v) => !v)}>
              <Plus size={14} /> {showBuilder ? "Hide Builder" : "New Plan"}
            </button>
          </div>

          {statusMessage && <p className="hh-text-green" style={{ margin: 0 }}>{statusMessage}</p>}

          {/* 7-day meal plan builder */}
          {showBuilder && (
            <>
              <div className="hh-card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "end" }}>
                  <div className="hh-field">
                    <label className="hh-field__label">Plan Name</label>
                    <div className="hh-input-wrap">
                      <input type="text" className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={planName} onChange={(e) => setPlanName(e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn--primary" onClick={handleSavePlan} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Plan"}
                  </button>
                </div>
              </div>

              {/* Day selector */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {DAYS.map((day) => (
                  <button key={day} onClick={() => setSelectedDay(day)} style={{
                    padding: "6px 14px", borderRadius: "var(--hh-radius-full)", fontSize: 12, fontWeight: 500,
                    border: "1px solid", cursor: "pointer",
                    borderColor: selectedDay === day ? "var(--hh-accent)" : "var(--hh-border)",
                    background: selectedDay === day ? "var(--hh-accent-20)" : "transparent",
                    color: selectedDay === day ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                  }}>{day.slice(0, 3)}</button>
                ))}
              </div>

              {/* Day planner + summary */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--hh-sp-24)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {MEAL_TYPES.map((mealType) => {
                    const meal = dayPlan[mealType];
                    return (
                      <div key={mealType} className="hh-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: meal ? 12 : 0 }}>
                          <h4 style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-14)", fontWeight: 600, textTransform: "capitalize" }}>{mealType}</h4>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setEditingMeal({ mealType, meal: meal ?? { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 } })}
                              className="btn btn--ghost" style={{ fontSize: 12, border: "1px solid var(--hh-border)", height: 28, padding: "0 10px" }}>
                              {meal ? "Edit" : "+ Add"}
                            </button>
                            {meal && (
                              <button onClick={() => handleRemoveMeal(mealType)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                                <Trash2 size={14} color="var(--hh-text-muted)" />
                              </button>
                            )}
                          </div>
                        </div>
                        {meal ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 14 }}>{meal.name}</span>
                            <div style={{ display: "flex", gap: 12 }}>
                              {[{ l: "Cal", v: meal.calories }, { l: "P", v: `${meal.protein}g` }, { l: "C", v: `${meal.carbs}g` }, { l: "F", v: `${meal.fat}g` }].map((m) => (
                                <div key={m.l} style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{m.v}</div>
                                  <div style={{ fontSize: 10, color: "var(--hh-text-muted)" }}>{m.l}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>No meal added</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Daily summary */}
                <div className="hh-card" style={{ alignSelf: "start" }}>
                  <h4 className="hh-panel-heading">{selectedDay} Summary</h4>
                  <div style={{ textAlign: "center", padding: "12px 0", borderBottom: "0.6px solid var(--hh-border)", marginBottom: 12 }}>
                    <div style={{ fontFamily: "var(--hh-font-display)", fontSize: 30, fontWeight: 700, color: "var(--hh-accent-light)" }}>{totalCalories}</div>
                    <div style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>Total Calories</div>
                  </div>
                  {[
                    { label: "Protein", val: `${totalProtein}g`, color: "var(--hh-accent)"       },
                    { label: "Carbs",   val: `${totalCarbs}g`,   color: "var(--hh-accent-light)" },
                    { label: "Fat",     val: `${totalFat}g`,     color: "#f59e0b"                },
                  ].map((m) => (
                    <div key={m.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, color: "var(--hh-text-muted)" }}>{m.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: m.color }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { label: "Total Plans", value: counts.all,       color: "var(--hh-text-primary)", key: "all"       },
              { label: "Active",      value: counts.active,    color: "var(--hh-text-green)",   key: "active"    },
              { label: "Completed",   value: counts.completed, color: "#3b82f6",                key: "completed" },
            ].map((stat) => (
              <div key={stat.key} onClick={() => setFilter(stat.key)} className="hh-card" style={{ padding: 20, textAlign: "center", cursor: "pointer", border: filter === stat.key ? `2px solid ${stat.color}` : "2px solid transparent" }}>
                <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Plans list */}
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
                {plans.length === 0 ? "No meal plans yet. Connect with a coach or create your own!" : "No plans match this filter."}
              </p>
            ) : (
              filtered.map((plan) => (
                <div key={plan.meal_plan_id} onClick={() => setSelectedPlan(plan)} style={{ padding: 20, borderBottom: "1px solid var(--hh-border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{plan.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>{plan.coach_name}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {plan.source === "client" && <span className="hh-badge hh-badge--sm">Your Plan</span>}
                    <span style={{ padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: STATUS_STYLES[plan.status]?.bg, color: STATUS_STYLES[plan.status]?.color }}>
                      {plan.status}
                    </span>
                    <span style={{ color: "var(--hh-text-muted)" }}>→</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
