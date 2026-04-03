"use client";

import { useState } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboards/coach",          active: false },
  { label: "My Clients",    href: "/dashboards/coach/clients",  active: false },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans",    href: "/dashboards/coach/meals",    active: true  },
  { label: "Schedule",      href: "/dashboards/coach/schedule", active: false },
  { label: "Chat",          href: "/dashboards/coach/chat",     active: false },
  { label: "Profile",       href: "/dashboards/coach/profile",  active: false },
  { label: "Settings",      href: "/dashboards/coach/settings", active: false },
];

const MOCK_CLIENTS = [
  { id: "1", name: "Alex Morgan"   },
  { id: "2", name: "Sam Chen"      },
  { id: "3", name: "Taylor Kim"    },
  { id: "4", name: "Morgan Davis"  },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Meal = { name: string; calories: number; protein: number; carbs: number; fat: number };
type DayPlan = { breakfast: Meal | null; lunch: Meal | null; dinner: Meal | null; snack: Meal | null };
type WeekPlan = Record<string, DayPlan>;

const EMPTY_MEAL: Meal = { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 };

const MOCK_PLAN: WeekPlan = {
  Monday: {
    breakfast: { name: "Oatmeal with berries",        calories: 350, protein: 12, carbs: 58, fat: 8  },
    lunch:     { name: "Grilled chicken salad",        calories: 480, protein: 42, carbs: 22, fat: 18 },
    dinner:    { name: "Salmon with sweet potato",     calories: 620, protein: 48, carbs: 52, fat: 22 },
    snack:     { name: "Greek yogurt",                 calories: 150, protein: 15, carbs: 12, fat: 3  },
  },
  Tuesday: {
    breakfast: { name: "Eggs and toast",               calories: 380, protein: 22, carbs: 34, fat: 16 },
    lunch:     { name: "Turkey wrap",                  calories: 420, protein: 35, carbs: 38, fat: 12 },
    dinner:    { name: "Beef stir fry with rice",      calories: 580, protein: 40, carbs: 62, fat: 14 },
    snack:     { name: "Almonds",                      calories: 180, protein: 6,  carbs: 6,  fat: 16 },
  },
  Wednesday: { breakfast: null, lunch: null, dinner: null, snack: null },
  Thursday:  { breakfast: null, lunch: null, dinner: null, snack: null },
  Friday:    { breakfast: null, lunch: null, dinner: null, snack: null },
  Saturday:  { breakfast: null, lunch: null, dinner: null, snack: null },
  Sunday:    { breakfast: null, lunch: null, dinner: null, snack: null },
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = typeof MEAL_TYPES[number];

export default function CoachMealPlans() {
  const [selectedClient, setSelectedClient] = useState("1");
  const [planName, setPlanName] = useState("Week 1 Nutrition Plan");
  const [plan, setPlan] = useState<WeekPlan>(MOCK_PLAN);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [editingMeal, setEditingMeal] = useState<{ mealType: MealType; meal: Meal } | null>(null);

  const dayPlan = plan[selectedDay];

  const totalCalories = MEAL_TYPES.reduce((sum, type) => {
    return sum + (dayPlan[type]?.calories ?? 0);
  }, 0);

  const totalProtein = MEAL_TYPES.reduce((sum, type) => {
    return sum + (dayPlan[type]?.protein ?? 0);
  }, 0);

  const handleSaveMeal = () => {
    if (!editingMeal) return;
    setPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [editingMeal.mealType]: editingMeal.meal,
      },
    }));
    setEditingMeal(null);
  };

  const handleRemoveMeal = (mealType: MealType) => {
    setPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [mealType]: null,
      },
    }));
  };

  return (
    <div className="hh-dash-root">

      {/* SIDEBAR */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="Coach navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={"hh-nav-link" + (item.active ? " hh-nav-link--active" : "")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 className="hh-page-title">MEAL PLANS</h1>
              <p className="hh-page-subtitle">Create and assign nutrition plans to your clients</p>
            </div>
            <button className="btn btn--primary" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <Plus size={14} /> New Plan
            </button>
          </div>

          {/* Plan info */}
          <div className="hh-card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="hh-field">
                <label className="hh-field__label">Plan Name</label>
                <div className="hh-input-wrap">
                  <input
                    type="text"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Assign to Client</label>
                <select
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  style={{ appearance: "auto" }}
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  {MOCK_CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Day selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--hh-radius-full)",
                  fontSize: "var(--hh-fs-12)",
                  fontWeight: 500,
                  border: "1px solid",
                  cursor: "pointer",
                  fontFamily: "var(--hh-font-body)",
                  borderColor: selectedDay === day ? "var(--hh-accent)" : "var(--hh-border)",
                  background: selectedDay === day ? "var(--hh-accent-20)" : "transparent",
                  color: selectedDay === day ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Day plan + summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "var(--hh-sp-24)" }}>

            {/* Meals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MEAL_TYPES.map((mealType) => {
                const meal = dayPlan[mealType];
                return (
                  <div key={mealType} className="hh-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: meal ? 12 : 0 }}>
                      <h4 style={{
                        fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-14)",
                        fontWeight: 600, color: "var(--hh-text-primary)",
                        textTransform: "capitalize",
                      }}>
                        {mealType}
                      </h4>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => setEditingMeal({ mealType, meal: meal ?? { ...EMPTY_MEAL } })}
                          className="btn btn--ghost"
                          style={{ fontSize: "var(--hh-fs-12)", border: "1px solid var(--hh-border)", height: 28, padding: "0 10px" }}
                        >
                          {meal ? "Edit" : "+ Add"}
                        </button>
                        {meal && (
                          <button
                            onClick={() => handleRemoveMeal(mealType)}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                          >
                            <Trash2 size={14} color="var(--hh-text-muted)" />
                          </button>
                        )}
                      </div>
                    </div>

                    {meal ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-primary)" }}>{meal.name}</span>
                        <div style={{ display: "flex", gap: 12 }}>
                          {[
                            { label: "Cal",  val: meal.calories },
                            { label: "P",    val: `${meal.protein}g` },
                            { label: "C",    val: `${meal.carbs}g` },
                            { label: "F",    val: `${meal.fat}g` },
                          ].map((m) => (
                            <div key={m.label} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, color: "var(--hh-text-primary)" }}>{m.val}</div>
                              <div style={{ fontSize: "var(--hh-fs-10)", color: "var(--hh-text-muted)" }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>No meal added</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Daily summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="hh-card">
                <h4 className="hh-panel-heading">{selectedDay} Summary</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ textAlign: "center", padding: "12px 0", borderBottom: "0.6px solid var(--hh-border)" }}>
                    <div style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-30)", fontWeight: 700, color: "var(--hh-accent-light)" }}>
                      {totalCalories}
                    </div>
                    <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Total Calories</div>
                  </div>
                  {[
                    { label: "Protein", val: `${totalProtein}g`, color: "var(--hh-accent)" },
                    { label: "Carbs",   val: `${MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.carbs ?? 0), 0)}g`, color: "var(--hh-accent-light)" },
                    { label: "Fat",     val: `${MEAL_TYPES.reduce((s, t) => s + (dayPlan[t]?.fat ?? 0), 0)}g`,   color: "#f59e0b" },
                  ].map((m) => (
                    <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)" }}>{m.label}</span>
                      <span style={{ fontSize: "var(--hh-fs-14)", fontWeight: 600, color: m.color }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn--primary" style={{ width: "100%" }}>
                Save &amp; Assign
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Edit meal modal */}
      {editingMeal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setEditingMeal(null)}
        >
          <div
            className="hh-card"
            style={{ width: "100%", maxWidth: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 600, color: "var(--hh-text-primary)", textTransform: "capitalize", marginBottom: 16 }}>
              {editingMeal.mealType}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="hh-field">
                <label className="hh-field__label">Meal Name</label>
                <div className="hh-input-wrap">
                  <input
                    type="text"
                    className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                    placeholder="e.g. Grilled chicken salad"
                    value={editingMeal.meal.name}
                    onChange={(e) => setEditingMeal({ ...editingMeal, meal: { ...editingMeal.meal, name: e.target.value } })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                  <div key={field} className="hh-field">
                    <label className="hh-field__label" style={{ textTransform: "capitalize" }}>
                      {field}{field !== "calories" ? " (g)" : ""}
                    </label>
                    <div className="hh-input-wrap">
                      <input
                        type="number"
                        className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                        value={editingMeal.meal[field]}
                        onChange={(e) => setEditingMeal({
                          ...editingMeal,
                          meal: { ...editingMeal.meal, [field]: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                className="btn btn--ghost"
                style={{ flex: 1, border: "1px solid var(--hh-border)" }}
                onClick={() => setEditingMeal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={handleSaveMeal}
              >
                Save Meal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
