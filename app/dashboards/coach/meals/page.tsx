"use client";

import { useEffect, useState } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { clientRequestService } from "@/services/ClientRequest";
import { mealPlanService } from "@/services/mealPlanService";
import { useAuthStore } from "@/store/authStore";

interface CoachClientOption {
  id: number;
  name: string;
}

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
  const user = useAuthStore((state) => state.user);
  const coachUserId = user?.id ?? user?.user_id;
  const [clients, setClients] = useState<CoachClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [planName, setPlanName] = useState("Week 1 Nutrition Plan");
  const [plan, setPlan] = useState<WeekPlan>(MOCK_PLAN);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [editingMeal, setEditingMeal] = useState<{ mealType: MealType; meal: Meal } | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!coachUserId) {
      setLoadingClients(false);
      return;
    }

    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const response = await clientRequestService.getAll(coachUserId);
        const acceptedClients = (response.requests ?? [])
          .filter((request) => request.status === "accepted")
          .map((request) => ({
            id: request.client_id,
            name: request.client_name ?? `Client #${request.client_id}`,
          }));

        const uniqueClients = acceptedClients.filter(
          (client, index, array) => array.findIndex((item) => item.id === client.id) === index,
        );

        setClients(uniqueClients);
        setSelectedClientId((current) => current || String(uniqueClients[0]?.id ?? ""));
      } catch (error) {
        setToast({
          message: error instanceof Error ? error.message : "Failed to load connected clients.",
          type: "error",
        });
      } finally {
        setLoadingClients(false);
      }
    };

    void loadClients();
  }, [coachUserId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const dayPlan = plan[selectedDay];
  const selectedClient = clients.find((client) => String(client.id) === selectedClientId);

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

  const handleAssignPlan = async () => {
    if (!coachUserId) {
      setToast({ message: "You need to be signed in as a coach.", type: "error" });
      return;
    }

    if (!selectedClientId) {
      setToast({ message: "Connect with a client before assigning a meal plan.", type: "error" });
      return;
    }

    if (!planName.trim()) {
      setToast({ message: "Meal plan name is required.", type: "error" });
      return;
    }

    const descriptionLines = DAYS.map((day) => {
      const meals = MEAL_TYPES
        .map((mealType) => {
          const meal = plan[day][mealType];
          return meal ? `${mealType}: ${meal.name} (${meal.calories} cal, P${meal.protein}/C${meal.carbs}/F${meal.fat})` : null;
        })
        .filter(Boolean);

      return `${day}: ${meals.length > 0 ? meals.join("; ") : "No meals assigned"}`;
    });

    try {
      setIsSaving(true);
      await mealPlanService.create(coachUserId, {
        client_id: Number(selectedClientId),
        name: planName.trim(),
        description: descriptionLines.join("\n"),
      });
      setSaved(true);
      setToast({ message: `Meal plan assigned to ${selectedClient?.name ?? "client"}.`, type: "success" });
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to assign meal plan.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="hh-dash-root">
      {toast ? (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 8, backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)", color: "white", fontSize: 14, fontWeight: 500, zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.message}
        </div>
      ) : null}

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

        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />

        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
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
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={loadingClients || clients.length === 0}
                >
                  {loadingClients ? <option value="">Loading connected clients...</option> : null}
                  {!loadingClients && clients.length === 0 ? <option value="">No connected clients yet</option> : null}
                  {!loadingClients && clients.length > 0
                    ? clients.map((client) => (
                        <option key={client.id} value={String(client.id)}>{client.name}</option>
                      ))
                    : null}
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

              <button className="btn btn--primary" style={{ width: "100%" }} onClick={handleAssignPlan} disabled={isSaving || loadingClients || clients.length === 0}>
                {isSaving ? "Saving..." : saved ? "✓ Assigned!" : "Save & Assign"}
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
