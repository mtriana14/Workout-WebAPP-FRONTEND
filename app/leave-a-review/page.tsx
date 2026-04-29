"use client";

import { useEffect, useState } from "react";

import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { billingService, type BillingCoach } from "@/services/billingService";
import { reviewService } from "@/services/reviewService";
import { useAuthStore } from "@/store/authStore";

export default function LeaveReviewPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const [coaches, setCoaches] = useState<BillingCoach[]>([]);
  const [coachId, setCoachId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await billingService.getCoaches();
        setCoaches(response.coaches);
        if (response.coaches[0]) {
          setCoachId(String(response.coaches[0].coach_id));
        }
      } catch (error) {
        setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to load coaches." });
      }
    };

    void loadCoaches();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setStatus({ type: "error", message: "Sign in before leaving a review." });
      return;
    }

    try {
      setSaving(true);
      const response = await reviewService.create({
        coach_id: Number(coachId),
        rating: Number(rating),
        comment,
      });
      setComment("");
      setStatus({ type: "success", message: response.message });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to submit review." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MemberPortalShell activePage="reviews" title="LEAVE A REVIEW" subtitle="Rate a coach and share feedback for other clients.">
      <form className="hh-card" onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
        {status ? <p className={status.type === "error" ? "hh-error-msg" : "hh-text-green"}>{status.message}</p> : null}
        <div className="hh-field">
          <label className="hh-field__label">Coach</label>
          <select className="hh-input" value={coachId} onChange={(event) => setCoachId(event.target.value)} style={{ appearance: "auto" }} required>
            {coaches.map((coach) => (
              <option key={coach.coach_id} value={coach.coach_id}>{coach.name}</option>
            ))}
          </select>
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Rating</label>
          <select className="hh-input" value={rating} onChange={(event) => setRating(event.target.value)} style={{ appearance: "auto" }}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </div>
        <div className="hh-field">
          <label className="hh-field__label">Review</label>
          <textarea className="hh-input" value={comment} onChange={(event) => setComment(event.target.value)} style={{ minHeight: 140, resize: "vertical", paddingTop: 12 }} required />
        </div>
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </MemberPortalShell>
  );
}
