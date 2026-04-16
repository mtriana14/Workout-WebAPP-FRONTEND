"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_COACH } from "@/router/router";
import { clientRequestService, ClientRequest } from "@/services/ClientRequest";
import { workoutPlanService, WorkoutPlan } from "@/services/workoutPlanService";
import { mealPlanService, MealPlan } from "@/services/mealPlanService";
import { useAuthStore } from "@/store/authStore";

const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

type ModalType = "client" | "workout" | "meal" | null;

export default function ClientsPage() {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Modal states
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRequest | null>(null);
  
  // Plans
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  
  // Form states
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | MealPlan | null>(null);
  
  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const userId = user?.id;

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadClients = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await clientRequestService.getAll(userId);
      const acceptedClients = data.requests.filter((r) => r.status === "accepted");
      setClients(acceptedClients);
    } catch {
      setError("Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadClients();
  }, [userId]);

  // Load plans when opening workout/meal modal
  const loadClientPlans = async (clientId: number, type: "workout" | "meal") => {
    if (!userId) return;
    setPlansLoading(true);
    try {
      if (type === "workout") {
        const data = await workoutPlanService.getByClient(userId, clientId);
        setWorkoutPlans(data.workout_plans);
      } else {
        const data = await mealPlanService.getByClient(userId, clientId);
        setMealPlans(data.meal_plans);
      }
    } catch {
      showToast("Failed to load plans", "error");
    } finally {
      setPlansLoading(false);
    }
  };

  // Open modals
  const openClientModal = (client: ClientRequest) => {
    setSelectedClient(client);
    setModalType("client");
  };

  const openWorkoutModal = async (client: ClientRequest) => {
    setSelectedClient(client);
    setModalType("workout");
    setPlanName("");
    setPlanDescription("");
    setEditingPlan(null);
    await loadClientPlans(client.client_id, "workout");
  };

  const openMealModal = async (client: ClientRequest) => {
    setSelectedClient(client);
    setModalType("meal");
    setPlanName("");
    setPlanDescription("");
    setEditingPlan(null);
    await loadClientPlans(client.client_id, "meal");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedClient(null);
    setEditingPlan(null);
    setPlanName("");
    setPlanDescription("");
  };

  // Create/Update workout plan
  const handleSaveWorkoutPlan = async () => {
    if (!userId || !selectedClient || !planName.trim()) return;
    setSaving(true);
    try {
      if (editingPlan) {
        await workoutPlanService.update(userId, (editingPlan as WorkoutPlan).plan_id, {
          name: planName,
          description: planDescription,
        });
        showToast("Workout plan updated!", "success");
      } else {
        await workoutPlanService.create(userId, {
          client_id: selectedClient.client_id,
          name: planName,
          description: planDescription,
        });
        showToast("Workout plan created!", "success");
      }
      setPlanName("");
      setPlanDescription("");
      setEditingPlan(null);
      await loadClientPlans(selectedClient.client_id, "workout");
    } catch {
      showToast("Failed to save workout plan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Create/Update meal plan
  const handleSaveMealPlan = async () => {
    if (!userId || !selectedClient || !planName.trim()) return;
    setSaving(true);
    try {
      if (editingPlan) {
        await mealPlanService.update(userId, (editingPlan as MealPlan).meal_plan_id, {
          name: planName,
          description: planDescription,
        });
        showToast("Meal plan updated!", "success");
      } else {
        await mealPlanService.create(userId, {
          client_id: selectedClient.client_id,
          name: planName,
          description: planDescription,
        });
        showToast("Meal plan created!", "success");
      }
      setPlanName("");
      setPlanDescription("");
      setEditingPlan(null);
      await loadClientPlans(selectedClient.client_id, "meal");
    } catch {
      showToast("Failed to save meal plan", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete plans
  const handleDeleteWorkoutPlan = async (planId: number) => {
    if (!userId || !selectedClient) return;
    try {
      await workoutPlanService.delete(userId, planId);
      showToast("Workout plan deleted", "success");
      await loadClientPlans(selectedClient.client_id, "workout");
    } catch {
      showToast("Failed to delete plan", "error");
    }
  };

  const handleDeleteMealPlan = async (planId: number) => {
    if (!userId || !selectedClient) return;
    try {
      await mealPlanService.delete(userId, planId);
      showToast("Meal plan deleted", "success");
      await loadClientPlans(selectedClient.client_id, "meal");
    } catch {
      showToast("Failed to delete plan", "error");
    }
  };

  // Edit plan
  const startEditPlan = (plan: WorkoutPlan | MealPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || "");
  };

  const filtered = clients.filter((c) =>
    `${c.client_name || ""} ${c.client_email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hh-dash-root">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            borderRadius: 8,
            backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1001,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Client Detail Modal */}
      {modalType === "client" && selectedClient && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={closeModal}
        >
          <div className="hh-card" style={{ width: 450, padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hh-border)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 20 }}>
                {selectedClient.client_name?.charAt(0) || "C"}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 18 }}>{selectedClient.client_name || `Client #${selectedClient.client_id}`}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--hh-text-muted)" }}>{selectedClient.client_email}</p>
              </div>
            </div>
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => openWorkoutModal(selectedClient)} style={{ padding: "14px 16px", border: "none", borderRadius: 8, backgroundColor: "var(--hh-accent)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                Manage Workout Plans
              </button>
              <button onClick={() => openMealModal(selectedClient)} style={{ padding: "14px 16px", border: "none", borderRadius: 8, backgroundColor: "var(--hh-text-green)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
                Manage Meal Plans
              </button>
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Plans Modal */}
      {modalType === "workout" && selectedClient && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={closeModal}
        >
          <div className="hh-card" style={{ width: 550, maxHeight: "85vh", overflow: "auto", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hh-border)" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Workout Plans - {selectedClient.client_name}</h2>
            </div>
            
            {/* Form */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hh-border)", backgroundColor: "var(--hh-bg-secondary)" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>{editingPlan ? "Edit Plan" : "Create New Plan"}</h4>
              <input
                type="text"
                placeholder="Plan name..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="hh-input"
                style={{ marginBottom: 10 }}
              />
              <textarea
                placeholder="Description (optional)..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="hh-input"
                rows={2}
                style={{ resize: "vertical", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSaveWorkoutPlan}
                  disabled={saving || !planName.trim()}
                  style={{ padding: "10px 20px", border: "none", borderRadius: 6, backgroundColor: "var(--hh-accent)", color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving || !planName.trim() ? 0.6 : 1 }}
                >
                  {saving ? "Saving..." : editingPlan ? "Update" : "Create"}
                </button>
                {editingPlan && (
                  <button onClick={() => { setEditingPlan(null); setPlanName(""); setPlanDescription(""); }} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Plans List */}
            <div style={{ padding: "20px 24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--hh-text-muted)" }}>Existing Plans</h4>
              {plansLoading ? (
                <p style={{ color: "var(--hh-text-muted)" }}>Loading...</p>
              ) : workoutPlans.length === 0 ? (
                <p style={{ color: "var(--hh-text-muted)" }}>No workout plans yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {workoutPlans.map((plan) => (
                    <div key={plan.plan_id} style={{ padding: 16, border: "1px solid var(--hh-border)", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600 }}>{plan.name}</p>
                          {plan.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{plan.description}</p>}
                          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>Status: <span style={{ color: plan.status === "active" ? "var(--hh-text-green)" : "var(--hh-text-muted)" }}>{plan.status}</span></p>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => startEditPlan(plan)} style={{ padding: "6px 12px", fontSize: 12, border: "1px solid var(--hh-border)", borderRadius: 4, backgroundColor: "transparent", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteWorkoutPlan(plan.plan_id)} style={{ padding: "6px 12px", fontSize: 12, border: "none", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plans Modal */}
      {modalType === "meal" && selectedClient && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={closeModal}
        >
          <div className="hh-card" style={{ width: 550, maxHeight: "85vh", overflow: "auto", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hh-border)" }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Meal Plans - {selectedClient.client_name}</h2>
            </div>
            
            {/* Form */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hh-border)", backgroundColor: "var(--hh-bg-secondary)" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14 }}>{editingPlan ? "Edit Plan" : "Create New Plan"}</h4>
              <input
                type="text"
                placeholder="Plan name..."
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="hh-input"
                style={{ marginBottom: 10 }}
              />
              <textarea
                placeholder="Description (optional)..."
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                className="hh-input"
                rows={2}
                style={{ resize: "vertical", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleSaveMealPlan}
                  disabled={saving || !planName.trim()}
                  style={{ padding: "10px 20px", border: "none", borderRadius: 6, backgroundColor: "var(--hh-text-green)", color: "white", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving || !planName.trim() ? 0.6 : 1 }}
                >
                  {saving ? "Saving..." : editingPlan ? "Update" : "Create"}
                </button>
                {editingPlan && (
                  <button onClick={() => { setEditingPlan(null); setPlanName(""); setPlanDescription(""); }} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Plans List */}
            <div style={{ padding: "20px 24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--hh-text-muted)" }}>Existing Plans</h4>
              {plansLoading ? (
                <p style={{ color: "var(--hh-text-muted)" }}>Loading...</p>
              ) : mealPlans.length === 0 ? (
                <p style={{ color: "var(--hh-text-muted)" }}>No meal plans yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {mealPlans.map((plan) => (
                    <div key={plan.meal_plan_id} style={{ padding: 16, border: "1px solid var(--hh-border)", borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600 }}>{plan.name}</p>
                          {plan.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{plan.description}</p>}
                          <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>Status: <span style={{ color: plan.status === "active" ? "var(--hh-text-green)" : "var(--hh-text-muted)" }}>{plan.status}</span></p>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => startEditPlan(plan)} style={{ padding: "6px 12px", fontSize: 12, border: "1px solid var(--hh-border)", borderRadius: 4, backgroundColor: "transparent", cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteMealPlan(plan.meal_plan_id)} style={{ padding: "6px 12px", fontSize: 12, border: "none", borderRadius: 4, backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />
        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">MY CLIENTS</h1>
            <p className="hh-page-subtitle">Manage your active coaching clients</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 32, fontWeight: 700, margin: 0, color: "var(--hh-text-green)" }}>{clients.length}</p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>Active Clients</p>
            </div>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>—</p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>Workout Plans</p>
            </div>
            <div className="hh-card" style={{ padding: 20, textAlign: "center" }}>
              <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>—</p>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: "4px 0 0" }}>Meal Plans</p>
            </div>
          </div>

          {/* Search */}
          <div className="hh-card">
            <input type="text" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="hh-input" style={{ maxWidth: 400 }} />
          </div>

          {/* Clients Grid */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Active Clients</h3>
            </div>

            {loading && <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading clients...</p>}
            {error && <p style={{ padding: 24, color: "var(--hh-error)" }}>{error}</p>}

            {!loading && !error && filtered.length === 0 && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}>
                {clients.length === 0 ? "No active clients yet." : "No clients match your search."}
              </p>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, backgroundColor: "var(--hh-border)" }}>
                {filtered.map((client) => (
                  <div
                    key={client.request_id}
                    onClick={() => openClientModal(client)}
                    style={{ padding: 20, backgroundColor: "var(--hh-bg-primary)", cursor: "pointer", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--hh-bg-secondary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--hh-bg-primary)")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 16 }}>
                        {client.client_name?.charAt(0) || "C"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{client.client_name || `Client #${client.client_id}`}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{client.client_email}</p>
                      </div>
                      <span style={{ fontSize: 18, color: "var(--hh-text-muted)" }}>→</span>
                    </div>
                    <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                      Client since {new Date(client.created_at).toLocaleDateString()}
                    </p>
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