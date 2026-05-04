"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_CLIENT } from "@/router/router";
import { clientDashboardService, CoachInfo } from "@/services/clientDashboardService";
import { reviewService, type CoachReview } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";
import { Dumbbell, Star } from "lucide-react";


export default function FindCoachesPage() {
  const { user } = useAuthStore();
  const [coaches, setCoaches] = useState<CoachInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<CoachInfo | null>(null);
  const [reviews, setReviews] = useState<CoachReview[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const userId = user?.id ?? user?.user_id;
  const [hasActiveCoach, setHasActiveCoach] = useState(false);

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const [coachesData, myCoachData] = await Promise.all([
        clientDashboardService.getCoaches(),
        userId ? clientDashboardService.getMyCoach(Number(userId)).catch(() => ({ coach: null })) : Promise.resolve({ coach: null }),
      ]);
      setCoaches(coachesData.coaches);
      setHasActiveCoach(!!myCoachData.coach);
    } catch {
      console.error("Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, [userId]);

  const handleSelectCoach = async (coach: CoachInfo) => {
    setSelectedCoach(coach);
    setReviews([]);
    setAvgRating(null);
    try {
      const data = await reviewService.getByCoach(coach.user_id);
      setReviews(data.reviews ?? []);
      setAvgRating(data.avg_rating ?? null);
    } catch {
      // non-critical
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendRequest = async () => {
    if (!userId || !selectedCoach) return;
    setSending(true);
    try {
      await clientDashboardService.sendRequest(userId, selectedCoach.coach_id, requestMessage);
      showToast("Request sent successfully!", "success");
      setSelectedCoach(null);
      setReviews([]);
      setAvgRating(null);
      setRequestMessage("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to send request", "error");
    } finally {
      setSending(false);
    }
  };

  const filtered = coaches.filter((c) =>
    `${c.name} ${c.specialization || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="hh-dash-root">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, padding: "12px 20px", borderRadius: 8, backgroundColor: toast.type === "success" ? "var(--hh-text-green)" : "var(--hh-error)", color: "white", fontSize: 14, fontWeight: 500, zIndex: 1001, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toast.message}
        </div>
      )}

      {/* Coach Detail Modal */}
      {selectedCoach && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => { setSelectedCoach(null); setReviews([]); setAvgRating(null); }}>
          <div className="hh-card" style={{ width: 500, maxHeight: "85vh", overflow: "auto", padding: 0 }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid var(--hh-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 24 }}>
                  {selectedCoach.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>{selectedCoach.name}</h2>
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--hh-text-muted)" }}>{selectedCoach.specialization || "Fitness Coach"}</p>
                  {avgRating !== null && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 13, color: "var(--hh-text-muted)" }}>
                      <Star size={13} color="var(--hh-accent)" fill="var(--hh-accent)" />
                      {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: 24 }}>
              {selectedCoach.bio && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>About</h4>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{selectedCoach.bio}</p>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>Experience</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>{selectedCoach.experience_years || "—"} years</p>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>Hourly Rate</h4>
                  <p style={{ margin: 0, fontSize: 14 }}>{selectedCoach.hourly_rate ? `$${selectedCoach.hourly_rate}/hr` : "Contact for pricing"}</p>
                </div>
              </div>

              {selectedCoach.availability.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>Availability</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {selectedCoach.availability.map((a, i) => (
                      <span key={i} style={{ padding: "4px 10px", backgroundColor: "var(--hh-bg-secondary)", borderRadius: 4, fontSize: 12 }}>
                        {a.day_of_week} {a.start_time.substring(0, 5)}-{a.end_time.substring(0, 5)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--hh-text-muted)", textTransform: "uppercase" }}>
                  Reviews {avgRating !== null && `· ${avgRating.toFixed(1)} avg`}
                </h4>
                {reviews.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-muted)" }}>No reviews yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reviews.map((r, i) => (
                      <div key={r.review_id} style={{ paddingBottom: 12, borderBottom: i < reviews.length - 1 ? "1px solid var(--hh-border)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ display: "flex" }}>
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} size={12} color="var(--hh-accent)" fill={idx < r.rating ? "var(--hh-accent)" : "none"} />
                            ))}
                          </div>
                          {r.reviewer_name && (
                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--hh-text-primary)" }}>{r.reviewer_name}</span>
                          )}
                          {r.created_at && (
                            <span style={{ fontSize: 11, color: "var(--hh-text-muted)" }}>
                              {new Date(r.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {r.comment && (
                          <p style={{ margin: 0, fontSize: 13, color: "var(--hh-text-secondary)", lineHeight: 1.5 }}>
                            &ldquo;{r.comment}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Request Form */}
              <div style={{ borderTop: "1px solid var(--hh-border)", paddingTop: 20 }}>
                {hasActiveCoach ? (
                  <div style={{ padding: "14px 16px", borderRadius: 8, backgroundColor: "rgba(234, 179, 8, 0.08)", border: "1px solid rgba(234, 179, 8, 0.3)" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--hh-warning)", fontWeight: 500 }}>
                      You already have an active coach. Dismiss your current coach from your dashboard before requesting a new one.
                    </p>
                  </div>
                ) : (
                  <>
                    <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Send a Request</h4>
                    <textarea
                      placeholder="Introduce yourself and tell the coach about your fitness goals..."
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      className="hh-input"
                      rows={3}
                      style={{ resize: "vertical", marginBottom: 12 }}
                    />
                    <button
                      onClick={handleSendRequest}
                      disabled={sending}
                      style={{ width: "100%", padding: "12px", border: "none", borderRadius: 8, backgroundColor: "var(--hh-accent)", color: "white", fontSize: 14, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.6 : 1 }}
                    >
                      {sending ? "Sending..." : "Send Request"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--hh-border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => { setSelectedCoach(null); setReviews([]); setAvgRating(null); }} style={{ padding: "10px 20px", border: "1px solid var(--hh-border)", borderRadius: 6, backgroundColor: "transparent", cursor: "pointer", fontSize: 14 }}>Close</button>
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
            <h1 className="hh-page-title">FIND A COACH</h1>
            <p className="hh-page-subtitle">Browse available coaches and send a request</p>
          </div>

          {/* Search */}
          <div className="hh-card">
            <input type="text" placeholder="Search by name or specialization..." value={search} onChange={(e) => setSearch(e.target.value)} className="hh-input" style={{ maxWidth: 400 }} />
          </div>

          {/* Coaches Grid */}
          {loading ? (
            <p style={{ color: "var(--hh-text-muted)" }}>Loading coaches...</p>
          ) : filtered.length === 0 ? (
            <div className="hh-card" style={{ padding: 40, textAlign: "center" }}>
              <p style={{ color: "var(--hh-text-muted)" }}>No coaches found</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {filtered.map((coach) => (
                <div key={coach.coach_id} className="hh-card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }} onClick={() => handleSelectCoach(coach)}>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "var(--hh-accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: 16 }}>
                        {coach.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{coach.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>{coach.specialization || "Fitness Coach"}</p>
                      </div>
                    </div>
                    {coach.bio && (
                      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--hh-text-secondary)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {coach.bio}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>
                        {coach.experience_years ? `${coach.experience_years} yrs exp` : ""}
                      </span>
                      {coach.hourly_rate && (
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--hh-text-green)" }}>
                          ${coach.hourly_rate}/hr
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "12px 20px", borderTop: "1px solid var(--hh-border)", backgroundColor: "var(--hh-bg-secondary)", textAlign: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--hh-accent)", fontWeight: 500 }}>View Profile →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
