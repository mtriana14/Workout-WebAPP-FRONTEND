"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavComponent from "@/components/NavComponent";
import { ProfilePhotoButton } from "@/components/ProfilePhotoButton";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, MyCoach, ClientWorkoutPlan, ClientMealPlan } from "@/services/clientDashboardService";
import { reviewService } from "@/services/reviewService";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell, Star } from "lucide-react";
import { NotificationBell } from "@/app/components/NotificationBell";

type DismissStep = "idle" | "confirm" | "review";

export default function ClientDashboardPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [myCoach, setMyCoach] = useState<MyCoach | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<ClientWorkoutPlan[]>([]);
  const [mealPlans, setMealPlans] = useState<ClientMealPlan[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Dismiss flow
  const [dismissStep, setDismissStep] = useState<DismissStep>("idle");
  const [dismissing, setDismissing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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
      const resolvedUserId = Number(userId);
      try {
        const [coachData, workoutData, mealData, profileData] = await Promise.all([
          clientDashboardService.getMyCoach(resolvedUserId),
          clientDashboardService.getMyWorkoutPlans(resolvedUserId),
          clientDashboardService.getMyMealPlans(resolvedUserId),
          profileService.getUser(resolvedUserId).catch(() => null),
        ]);
        setMyCoach(coachData.coach);
        setWorkoutPlans(workoutData.workout_plans);
        setMealPlans(mealData.meal_plans);
        setProfilePhoto(profileData?.user.profile_photo ?? null);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [hasAuth, hasHydrated, router, token, user, userId]);

  const handleDismissConfirm = async () => {
    if (!myCoach) return;
    setDismissing(true);
    try {
      await clientDashboardService.dismissCoach(myCoach.coach_id);
      setDismissStep("review");
    } catch (err) {
      console.error("Failed to dismiss coach", err);
    } finally {
      setDismissing(false);
    }
  };

  const finalizeDismiss = () => {
    setMyCoach(null);
    setDismissStep("idle");
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!myCoach || rating === 0) return;
    setSubmittingReview(true);
    try {
      await reviewService.create({ coach_id: myCoach.user_id, rating, comment });
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmittingReview(false);
      finalizeDismiss();
    }
  };

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
      {/* Confirm dismiss modal */}
      {dismissStep === "confirm" && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
          onClick={() => setDismissStep("idle")}
        >
          <div className="hh-card" style={{ width: 420, padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>Dismiss Coach</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--hh-text-muted)", lineHeight: 1.6 }}>
              Are you sure you want to end your coaching relationship with <strong>{myCoach?.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDismissStep("idle")}
                style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDismissConfirm}
                disabled={dismissing}
                style={{ padding: "10px 20px", border: "none", borderRadius: 6, backgroundColor: "var(--hh-error)", color: "white", cursor: dismissing ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, opacity: dismissing ? 0.6 : 1 }}
              >
                {dismissing ? "Dismissing..." : "Yes, dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {dismissStep === "review" && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
        >
          <div className="hh-card" style={{ width: 460, padding: 32 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Leave a Review</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--hh-text-muted)" }}>
              Would you like to rate your experience with <strong>{myCoach?.name}</strong>?
            </p>

            {/* Star rating */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                >
                  <Star
                    size={28}
                    color="var(--hh-accent)"
                    fill={star <= (hoverRating || rating) ? "var(--hh-accent)" : "none"}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your experience (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="hh-input"
              rows={3}
              style={{ resize: "vertical", marginBottom: 20 }}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={finalizeDismiss}
                style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={rating === 0 || submittingReview}
                style={{ padding: "10px 20px", border: "none", borderRadius: 6, backgroundColor: "var(--hh-accent)", color: "white", cursor: rating === 0 || submittingReview ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, opacity: rating === 0 || submittingReview ? 0.6 : 1 }}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 className="hh-page-title">MY DASHBOARD</h1>
              <p className="hh-page-subtitle">Welcome back, {displayName}!</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {userId && <NotificationBell userId={Number(userId)} />}
              <ProfilePhotoButton displayName={displayName} profilePhoto={profilePhoto} userId={userId} />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>My Coach</p>
              <p style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 0", color: myCoach ? "var(--hh-text-green)" : "var(--hh-text-muted)" }}>
                {loading ? "..." : myCoach ? myCoach.name : "None"}
              </p>
            </div>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Workouts</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-accent)" }}>
                {loading ? "..." : activePlans}
              </p>
            </div>
            <div className="hh-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Meal Plans</p>
              <p style={{ fontSize: 36, fontWeight: 700, margin: "8px 0 0", color: "var(--hh-text-green)" }}>
                {loading ? "..." : activeMeals}
              </p>
            </div>
          </div>

          {/* My Coach Card */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>My Coach</h3>
              {!myCoach && !loading && (
                <a href="/dashboards/client/coaches" style={{ fontSize: 13, color: "var(--hh-accent)", textDecoration: "none", fontWeight: 500 }}>
                  Find a Coach →
                </a>
              )}
            </div>
            <div style={{ padding: 24 }}>
              {loading ? (
                <p style={{ color: "var(--hh-text-muted)" }}>Loading...</p>
              ) : myCoach ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
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
                  <button
                    onClick={() => setDismissStep("confirm")}
                    style={{ padding: "8px 16px", border: "1px solid var(--hh-error)", borderRadius: 6, backgroundColor: "transparent", color: "var(--hh-error)", cursor: "pointer", fontSize: 13, fontWeight: 600, flexShrink: 0 }}
                  >
                    Dismiss Coach
                  </button>
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
