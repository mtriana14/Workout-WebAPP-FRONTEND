"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, DollarSign, User as UserIcon, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { getStoredAuthToken, fetchCoachById, sendCoachingRequest, type CoachRecord } from "@/app/lib/api";
import { reviewService, type CoachReview } from "@/services/reviewService";

export default function CoachProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  const [coach, setCoach] = useState<CoachRecord | null>(null);
  const [reviews, setReviews] = useState<CoachReview[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for UC 2.3 (Sending a Request)
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    async function loadCoach() {
      const token = getStoredAuthToken();
      if (!token) return;

      try {
        setIsLoading(true);
        // Extract the ID from the dynamic URL (e.g., /coaches/5)
        const coachId = parseInt(params.id as string, 10);
        const data = await fetchCoachById(token, coachId);
        setCoach(data);
        try {
          const reviewData = await reviewService.getByCoach(coachId);
          setReviews(reviewData.reviews ?? []);
          setAvgRating(reviewData.avg_rating ?? null);
        } catch {
          // reviews are non-critical
        }
      } catch (err) {
        setError("Unable to load coach profile.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCoach();
  }, [params.id]);

  async function handleSendRequest() {
    const token = getStoredAuthToken();
    if (!token || !coach) return;

    setIsRequesting(true);
    
    try {
      await sendCoachingRequest(token, coach.user_id, requestMessage);
      
      setRequestSent(true);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to send request.");
    } finally  {
      setIsRequesting(false);
    }
  }

  if (isLoading) {
    return (
      <MemberPortalShell activePage="coaches" title="LOADING PROFILE" subtitle="Fetching coach details...">
        <p>Loading...</p>
      </MemberPortalShell>
    );
  }

  if (error || !coach) {
    return (
      <MemberPortalShell activePage="coaches" title="COACH NOT FOUND" subtitle="We couldn't find this profile.">
        <div className="hh-card">
          <p className="hh-error-msg">{error || "Coach not found."}</p>
          <button className="btn btn--secondary" onClick={() => router.push("/coaches")} style={{ marginTop: 16 }}>
            Back to Coach Discovery
          </button>
        </div>
      </MemberPortalShell>
    );
  }

  return (
    <MemberPortalShell
      activePage="coaches"
      title={`${coach.first_name.toUpperCase()} ${coach.last_name.toUpperCase()}`}
      subtitle="View qualifications, experience, and request coaching."
      headerActions={
        <button type="button" className="hh-portal-button hh-portal-button--ghost" onClick={() => router.push("/coaches")}>
          <ArrowLeft size={16} style={{ marginRight: 8 }} />
          Back to Search
        </button>
      }
    >
      <div className="hh-bottom-row">
        
        {/* LEFT COLUMN: Profile Info */}
        <section style={{ flex: 2, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="hh-card" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <div 
              style={{ 
                width: 100, height: 100, borderRadius: "50%", backgroundColor: "var(--hh-bg-elevated)", 
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}
            >
              <UserIcon size={48} color="var(--hh-text-muted)" />
            </div>
            
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: "white", margin: 0 }}>
                  {coach.first_name} {coach.last_name}
                </h2>
                <ShieldCheck size={20} color="var(--hh-accent)" />
              </div>
              
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <span className="hh-portal-pill">{coach.specialty}</span>
                {avgRating !== null && (
                  <span className="hh-portal-pill" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Star size={12} color="var(--hh-accent)" fill="var(--hh-accent)" />
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                )}
              </div>
              
              <p className="hh-portal-card-copy" style={{ fontSize: 16, lineHeight: 1.6 }}>
                {coach.bio}
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div className="hh-card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <h2 className="hh-panel-heading" style={{ margin: 0 }}>Reviews</h2>
              {avgRating !== null && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--hh-text-muted)" }}>
                  <Star size={13} color="var(--hh-accent)" fill="var(--hh-accent)" />
                  {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {reviews.length === 0 ? (
              <p style={{ color: "var(--hh-text-muted)", fontSize: 14 }}>No reviews yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {reviews.map((r, i) => (
                  <div key={r.review_id} style={{ paddingBottom: 16, borderBottom: i < reviews.length - 1 ? "1px solid var(--hh-border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ display: "flex" }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={13} color="var(--hh-accent)" fill={idx < r.rating ? "var(--hh-accent)" : "none"} />
                        ))}
                      </div>
                      {r.reviewer_name && (
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--hh-text-primary)" }}>{r.reviewer_name}</span>
                      )}
                      {r.created_at && (
                        <span style={{ fontSize: 12, color: "var(--hh-text-muted)" }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {r.comment && (
                      <p className="hh-portal-card-copy" style={{ margin: 0 }}>&ldquo;{r.comment}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </section>

        {/* RIGHT COLUMN: Actions & Details */}
        <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="hh-card">
            <h2 className="hh-panel-heading" style={{ marginBottom: 16 }}>Coaching Details</h2>
            
            <div className="hh-portal-summary-list">
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Monthly Rate</span>
                <p className="hh-portal-summary-value" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <DollarSign size={16} color="var(--hh-green)" /> {coach.price}
                </p>
              </div>
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Availability</span>
                <p className="hh-portal-summary-value" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={16} /> Accepting Clients
                </p>
              </div>
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Experience</span>
                <p className="hh-portal-summary-value">5+ Years</p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              {requestSent ? (
                <div style={{ padding: 16, backgroundColor: "rgba(145, 89, 133, 0.1)", borderRadius: 8, textAlign: "center", border: "1px solid var(--hh-accent)" }}>
                  <CheckCircle size={24} color="var(--hh-accent)" style={{ margin: "0 auto 8px" }} />
                  <h3 style={{ color: "white", fontSize: 16, marginBottom: 4 }}>Request Sent!</h3>
                  <p className="hh-text-muted" style={{ fontSize: 13 }}>{coach.first_name} will review your message and respond shortly.</p>
                </div>
              ) : (
                <>
                  <label className="hh-field__label" style={{ marginBottom: 8, display: "block" }}>Add a message (optional)</label>
                  <textarea 
                    className="hh-portal-textarea" 
                    placeholder={`Hi ${coach.first_name}, I'm interested in training with you...`}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                  <button 
                    className="btn btn--primary" 
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={handleSendRequest}
                    disabled={isRequesting}
                  >
                    {isRequesting ? "Sending..." : "Request Coaching"}
                  </button>
                </>
              )}
            </div>
          </div>

        </section>
      </div>
    </MemberPortalShell>
  );
}