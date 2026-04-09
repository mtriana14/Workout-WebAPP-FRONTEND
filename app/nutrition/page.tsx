"use client";

import { useState, useEffect } from "react";
import { Utensils, Calendar, CheckCircle, Circle, Apple, ChevronRight, AlertCircle } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { getStoredAuthToken, fetchMealPlansRequest, markMealCompletedRequest } from "@/app/lib/api";

// Mock Data Interfaces
interface Meal {
  id: number;
  name: string;
  details: string;
  calories: number;
  completed: boolean;
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface MealPlan {
  id: number;
  title: string;
  coach: string;
  days: DayPlan[];
}

export default function NutritionPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  
  // Demo Hack: Allows you to toggle Alternative Flow 1 for the presentation
  const [showEmptyState, setShowEmptyState] = useState(false); 

  // Load fake data to simulate the backend
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPlans([
        {
          id: 1,
          title: "High Protein Muscle Builder",
          coach: "Coach Sarah",
          days: [
            {
              day: "Monday",
              meals: [
                { id: 101, name: "Breakfast", details: "4 Scrambled Eggs, 2 slices whole wheat toast, black coffee", calories: 450, completed: true },
                { id: 102, name: "Lunch", details: "8oz Chicken Breast, 1 cup Brown Rice, Steamed Broccoli", calories: 600, completed: false },
                { id: 103, name: "Dinner", details: "6oz Salmon, Asparagus, Quinoa", calories: 550, completed: false },
                { id: 104, name: "Snack", details: "Greek Yogurt with mixed berries", calories: 200, completed: false }
              ]
            },
            {
              day: "Tuesday",
              meals: [
                { id: 201, name: "Breakfast", details: "Oatmeal with whey protein and almonds", calories: 500, completed: false },
                { id: 202, name: "Lunch", details: "Turkey Wrap with spinach and hummus", calories: 550, completed: false },
                { id: 203, name: "Dinner", details: "Lean Ground Beef Bowl with sweet potato", calories: 650, completed: false }
              ]
            }
          ]
        }
      ]);
      setSelectedPlanId(1);
      setIsLoading(false);
    }, 800);
  }, []);

  // Handle UC 5.1 Step 6: Marking meals as complete
  async function toggleMealCompletion(planId: number, dayName: string, mealId: number, currentStatus: boolean) {
    const token = getStoredAuthToken();
    
    // Optimistic UI Update (Updates the screen instantly before the fake backend responds)
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id !== planId) return plan;
      return {
        ...plan,
        days: plan.days.map(day => {
          if (day.day !== dayName) return day;
          return {
            ...day,
            meals: day.meals.map(meal => 
              meal.id === mealId ? { ...meal, completed: !currentStatus } : meal
            )
          };
        })
      };
    }));

    // Fake API call to simulate backend tracking
    if (token) {
      try {
        // await markMealCompletedRequest(token, mealId, !currentStatus);
        console.log(`Simulated updating meal ${mealId} to ${!currentStatus}`);
      } catch (err) {
        console.error("Failed to update backend");
      }
    }
  }

  // Find the currently active plan data
  const activePlan = plans.find(p => p.id === selectedPlanId);
  const activeDayPlan = activePlan?.days.find(d => d.day === selectedDay);

  return (
    // @ts-ignore - Bypassing type check temporarily if "nutrition" is missing from memberPortalShell.tsx ActivePage types
    <MemberPortalShell activePage="nutrition" title="NUTRITION" subtitle="View your meal plans and track your daily diet.">
      
      {isLoading ? (
        <div className="hh-card" style={{ textAlign: "center", padding: 48 }}>
          <p className="hh-portal-card-copy">Loading meal plans...</p>
        </div>
      ) : showEmptyState || plans.length === 0 ? (
        // UC 5.1 - ALTERNATIVE FLOW 1: NO MEAL PLANS
        <div className="hh-card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <Apple size={48} color="var(--hh-text-muted)" style={{ margin: "0 auto 16px" }} />
          <h2 className="hh-panel-heading">No Meal Plans Found</h2>
          <p className="hh-portal-card-copy" style={{ marginBottom: 24, maxWidth: 400, margin: "0 auto 24px" }}>
            No Meal Plans. Create one or ask your nutrition coach to assign one to your account.
          </p>
          <button className="btn btn--primary" onClick={() => alert("Demo: Route to Coach Request page")}>
            Find a Nutrition Coach
          </button>
        </div>
      ) : (
        // UC 5.1 - IDEAL FLOW
        <div className="hh-bottom-row">
          
          {/* LEFT COLUMN: Plan Selection & Days */}
          <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Step 2 & 3: Select a Plan */}
            <div className="hh-card">
              <h3 className="hh-panel-heading" style={{ fontSize: 16, marginBottom: 12 }}>Available Plans</h3>
              <select 
                className="hh-input" 
                value={selectedPlanId || ""} 
                onChange={(e) => setSelectedPlanId(parseInt(e.target.value))}
              >
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.title}</option>
                ))}
              </select>
              {activePlan && (
                <p className="hh-text-muted" style={{ fontSize: 13, marginTop: 8 }}>
                  Assigned by: <span style={{ color: "white" }}>{activePlan.coach}</span>
                </p>
              )}
            </div>

            {/* Step 4: Organized by day */}
            <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px", borderBottom: "1px solid #2c2c30", display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={18} color="var(--hh-accent)" />
                <h3 className="hh-panel-heading" style={{ margin: 0, fontSize: 16 }}>Schedule</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {activePlan?.days.map(dayObj => (
                  <button
                    key={dayObj.day}
                    onClick={() => setSelectedDay(dayObj.day)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      backgroundColor: selectedDay === dayObj.day ? "var(--hh-bg-elevated)" : "transparent",
                      border: "none",
                      borderBottom: "1px solid #2c2c30",
                      color: selectedDay === dayObj.day ? "white" : "var(--hh-text-muted)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: selectedDay === dayObj.day ? 600 : 400
                    }}
                  >
                    {dayObj.day}
                    {selectedDay === dayObj.day && <ChevronRight size={16} color="var(--hh-accent)" />}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Meals for the selected day */}
          <section className="hh-card" style={{ flex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #2c2c30" }}>
              <div>
                <h2 className="hh-panel-heading" style={{ margin: 0 }}>{selectedDay}'s Meals</h2>
                <p className="hh-portal-card-copy" style={{ marginTop: 4 }}>Check off meals as you complete them.</p>
              </div>
              <Utensils size={24} color="var(--hh-text-muted)" />
            </div>

            {/* Step 5 & 6: View meals and mark as complete */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeDayPlan?.meals.map(meal => (
                <div 
                  key={meal.id} 
                  style={{ 
                    display: "flex", 
                    gap: 16, 
                    padding: 16, 
                    backgroundColor: "var(--hh-bg-elevated)", 
                    borderRadius: 8,
                    border: meal.completed ? "1px solid var(--hh-green)" : "1px solid transparent",
                    transition: "all 0.2s ease"
                  }}
                >
                  <button 
                    onClick={() => {
                      if (activePlan && activeDayPlan) {
                        toggleMealCompletion(activePlan.id, activeDayPlan.day, meal.id, meal.completed);
                      }
                    }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}
                    title={meal.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {meal.completed ? (
                      <CheckCircle size={24} color="var(--hh-green)" fill="rgba(35, 134, 54, 0.2)" />
                    ) : (
                      <Circle size={24} color="var(--hh-text-muted)" />
                    )}
                  </button>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <h3 style={{ color: "white", fontSize: 16, fontWeight: 600, textDecoration: meal.completed ? "line-through" : "none", opacity: meal.completed ? 0.7 : 1 }}>
                        {meal.name}
                      </h3>
                      <span className="hh-badge hh-badge--sm" style={{ backgroundColor: "var(--hh-bg-card)", color: "var(--hh-text-muted)" }}>
                        {meal.calories} kcal
                      </span>
                    </div>
                    <p className="hh-portal-card-copy" style={{ fontSize: 14, opacity: meal.completed ? 0.7 : 1 }}>
                      {meal.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* DEMO HACK: Invisible Button to toggle Empty State for your presentation */}
      <button 
        onClick={() => setShowEmptyState(!showEmptyState)}
        style={{ position: "fixed", bottom: 10, right: 10, opacity: 0.1, fontSize: 10 }}
      >
        Toggle Empty State (UC 5.1 Alt)
      </button>

    </MemberPortalShell>
  );
}