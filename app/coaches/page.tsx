"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Star, DollarSign, X, User as UserIcon } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { getStoredAuthToken, fetchCoaches, type CoachRecord } from "@/app/lib/api";

export default function FindCoachesPage() {
  const [coaches, setCoaches] = useState<CoachRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // UC 2.1 Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");

  useEffect(() => {
    async function loadCoaches() {
      const token = getStoredAuthToken();
      if (!token) return;

      try {
        setIsLoading(true);
        const data = await fetchCoaches(token);
        setCoaches(data);
      } catch (err) {
        setError("Unable to connect to the database to retrieve coaches.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCoaches();
  }, []);

  // Apply all search queries and filters simultaneously
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const fullName = `${coach.first_name} ${coach.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      const matchesSpecialty = specialtyFilter ? coach.specialty === specialtyFilter : true;
      const matchesRating = ratingFilter ? coach.rating >= parseFloat(ratingFilter) : true;
      const matchesPrice = maxPriceFilter ? coach.price <= parseInt(maxPriceFilter) : true;

      return matchesSearch && matchesSpecialty && matchesRating && matchesPrice;
    });
  }, [coaches, searchQuery, specialtyFilter, ratingFilter, maxPriceFilter]);

  // UC 2.1 - Alternative Flow 2: Clear Filters
  function clearFilters() {
    setSearchQuery("");
    setSpecialtyFilter("");
    setRatingFilter("");
    setMaxPriceFilter("");
  }

  return (
    <MemberPortalShell
      activePage="coaches"
      title="FIND COACHES"
      subtitle="Browse and filter our roster of professional trainers to find your perfect match."
    >
      {error && <p className="hh-error-msg">{error}</p>}

      {/* SEARCH AND FILTER BAR */}
      <div className="hh-card" style={{ marginBottom: 24, padding: "16px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          
          <div className="hh-input-wrap" style={{ flex: "1 1 250px", margin: 0 }}>
            <Search size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
            <input
              type="text"
              placeholder="Search coach by name..."
              className="hh-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", flex: "2 1 auto" }}>
            <div className="hh-input-wrap" style={{ margin: 0, flex: 1 }}>
              <Filter size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
              <select className="hh-input" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                <option value="">All Specialties</option>
                <option value="Strength Training">Strength Training</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Yoga">Yoga</option>
                <option value="Endurance">Endurance</option>
                <option value="CrossFit">CrossFit</option>
              </select>
            </div>

            <div className="hh-input-wrap" style={{ margin: 0, flex: 1 }}>
              <Star size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
              <select className="hh-input" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4.8">4.8+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
              </select>
            </div>

            <div className="hh-input-wrap" style={{ margin: 0, flex: 1 }}>
              <DollarSign size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
              <select className="hh-input" value={maxPriceFilter} onChange={(e) => setMaxPriceFilter(e.target.value)}>
                <option value="">Any Price</option>
                <option value="100">Under $100</option>
                <option value="150">Under $150</option>
                <option value="200">Under $200</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS DISPLAY */}
      {isLoading ? (
        <p>Loading coaches from the database...</p>
      ) : filteredCoaches.length === 0 ? (
        // UC 2.1 - Alternative Flow 1: No Matches
        <div className="hh-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Search size={48} color="var(--hh-text-muted)" style={{ margin: "0 auto 16px" }} />
          <h2 className="hh-panel-heading">No results found!</h2>
          <p className="hh-portal-card-copy" style={{ marginBottom: 24 }}>
            Try and edit your filters or update your search query to see more results.
          </p>
          <button type="button" className="btn btn--secondary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="hh-stats-grid">
          {filteredCoaches.map((coach) => (
            <div key={coach.user_id} className="hh-card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div 
                  style={{ 
                    width: 56, height: 56, borderRadius: "50%", backgroundColor: "var(--hh-bg-elevated)", 
                    display: "flex", alignItems: "center", justifyContent: "center" 
                  }}
                >
                  <UserIcon size={24} color="var(--hh-text-muted)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "white" }}>
                    {coach.first_name} {coach.last_name}
                  </h3>
                  <span className="hh-portal-pill" style={{ marginTop: 4 }}>{coach.specialty}</span>
                </div>
              </div>

              <p className="hh-portal-card-copy" style={{ flex: 1, marginBottom: 24 }}>
                {coach.bio}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #2c2c30", paddingTop: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Star size={16} color="var(--hh-accent)" fill="var(--hh-accent)" />
                  <span style={{ fontWeight: 600 }}>{coach.rating}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <DollarSign size={16} color="var(--hh-text-muted)" />
                  <span style={{ fontWeight: 600 }}>${coach.price} <span className="hh-text-muted" style={{ fontWeight: 400, fontSize: 12 }}>/mo</span></span>
                </div>
              </div>

              <button 
                className="btn btn--ghost" 
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => alert(`Redirect to Coach Profile for ${coach.first_name} (UC 2.2)`)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </MemberPortalShell>
  );
}