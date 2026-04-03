"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MemberPortalShell } from "@/app/components/memberPortalShell";
import {
  WEEK_DAYS,
  type DashboardSettings,
  type WeekDay,
  useMemberPortal,
} from "@/app/lib/memberPortal";

const WEEKLY_MINUTES: Record<WeekDay, number> = {
  Mon: 50,
  Tue: 30,
  Wed: 60,
  Thu: 20,
  Fri: 45,
  Sat: 40,
  Sun: 25,
};

const CARD_ICONS = ["🏋️", "🔥", "💧", "😴"] as const;

function sortDays(days: WeekDay[]) {
  return [...days].sort((left, right) => WEEK_DAYS.indexOf(left) - WEEK_DAYS.indexOf(right));
}

function numberFromInput(value: string, fallback: number) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
}

export default function UserDashboardPage() {
  const { dashboard, profile, saveDashboard } = useMemberPortal();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<DashboardSettings>(dashboard);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setDraft(dashboard);
  }, [dashboard]);

  const today = new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(new Date())
    .slice(0, 3) as WeekDay;

  const activeDays = dashboard.trainingDays.length;
  const statCards = [
    {
      label: "Workouts Completed",
      value: dashboard.workoutsCompleted.toString(),
      delta: `${activeDays} active days this week`,
    },
    {
      label: "Current Streak",
      value: `${dashboard.currentStreak} days`,
      delta: "Consistency is trending up",
    },
    {
      label: "Hydration Goal",
      value: `${dashboard.hydrationGoal} oz`,
      delta: draft.mealFocus,
    },
    {
      label: "Sleep Target",
      value: `${dashboard.sleepGoal} hrs`,
      delta: dashboard.recoveryFocus,
    },
  ];

  function handleDraftChange<Key extends keyof DashboardSettings>(
    key: Key,
    value: DashboardSettings[Key],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleTrainingDay(day: WeekDay) {
    setDraft((current) => {
      const nextDays = current.trainingDays.includes(day)
        ? current.trainingDays.filter((currentDay) => currentDay !== day)
        : [...current.trainingDays, day];

      return {
        ...current,
        trainingDays: sortDays(nextDays),
      };
    });
  }

  function handleCancel() {
    setDraft(dashboard);
    setIsEditing(false);
    setStatus("");
  }

  async function handleSave() {
    try {
      await saveDashboard({
        ...draft,
        trainingDays: sortDays(draft.trainingDays),
      });
      setStatus("Dashboard saved.");
      setIsEditing(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save dashboard.");
    }
  }

  return (
    <MemberPortalShell
      activePage="dashboard"
      title="MY DASHBOARD"
      subtitle={`Welcome back, ${profile.firstName}. Adjust your plan, review your current targets, and keep your coaching details up to date.`}
      headerActions={
        <>
          <Link href="/profile" className="hh-portal-button hh-portal-button--ghost">
            Edit Profile
          </Link>
          {isEditing ? (
            <>
              <button type="button" className="hh-portal-button hh-portal-button--secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={handleSave}>
                Save Dashboard
              </button>
            </>
          ) : (
            <button type="button" className="hh-portal-button hh-portal-button--primary" onClick={() => setIsEditing(true)}>
              Edit Dashboard
            </button>
          )}
        </>
      }
    >
      <div className="hh-stats-grid">
        {statCards.map((card, index) => (
          <div key={card.label} className="hh-card">
            <div className="hh-card__header">
              <span className="hh-card__label">{card.label}</span>
              <div className="hh-card__icon" style={{ fontSize: 16 }}>
                {CARD_ICONS[index]}
              </div>
            </div>
            <p className="hh-card__value">{card.value}</p>
            <p className="hh-card__delta hh-text-muted">{card.delta}</p>
          </div>
        ))}
      </div>

      {status ? <p className="hh-portal-status">{status}</p> : null}

      <div className="hh-bottom-row">
        <section id="activity" className="hh-card" style={{ flex: 2 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Weekly Rhythm
              </h2>
              <p className="hh-portal-card-copy">
                Your selected training days shape the weekly schedule below.
              </p>
            </div>
            <span className="hh-portal-pill">{activeDays} planned days</span>
          </div>

          <div className="hh-portal-week-grid">
            {WEEK_DAYS.map((day) => {
              const isActive = dashboard.trainingDays.includes(day);
              const minutes = isActive ? WEEKLY_MINUTES[day] : 0;

              return (
                <div key={day} className="hh-portal-week-day">
                  <div
                    className="hh-portal-week-bar"
                    style={{
                      height: isActive ? `${Math.max(20, minutes)}px` : "18px",
                      background:
                        day === today
                          ? "linear-gradient(180deg, rgba(171, 135, 163, 1) 0%, rgba(145, 89, 133, 1) 100%)"
                          : isActive
                            ? "rgba(145, 89, 133, 0.55)"
                            : "#2c2c30",
                    }}
                  />
                  <span className="hh-portal-week-label">{day}</span>
                  <span className="hh-portal-week-value">{isActive ? `${minutes}m` : "Rest"}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="hh-card" style={{ flex: 1 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Next Session
              </h2>
              <p className="hh-portal-card-copy">Your upcoming check-in and current focus.</p>
            </div>
          </div>

          <div className="hh-portal-summary-list">
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Session</span>
              <p className="hh-portal-summary-value">{dashboard.nextSessionTitle}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">When</span>
              <p className="hh-portal-summary-value">{dashboard.nextSessionDate}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Format</span>
              <p className="hh-portal-summary-value">{dashboard.nextSessionFormat}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Focus</span>
              <p className="hh-portal-summary-value">{dashboard.focusArea}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="hh-bottom-row">
        <section id="goals" className="hh-card" style={{ flex: 2 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Goals & Plan Details
              </h2>
              <p className="hh-portal-card-copy">
                Update the plan details that should be visible on your dashboard.
              </p>
            </div>
            {isEditing ? <span className="hh-portal-pill">Editing</span> : null}
          </div>

          {isEditing ? (
            <div className="hh-portal-form-grid">
              <label className="hh-field">
                <span className="hh-field__label">Focus area</span>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.focusArea}
                  onChange={(event) => handleDraftChange("focusArea", event.target.value)}
                />
              </label>

              <label className="hh-field">
                <span className="hh-field__label">Preferred session time</span>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.preferredSessionTime}
                  onChange={(event) => handleDraftChange("preferredSessionTime", event.target.value)}
                />
              </label>

              <label className="hh-field">
                <span className="hh-field__label">Weekly workout goal</span>
                <input
                  type="number"
                  min="1"
                  max="7"
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.weeklyWorkoutGoal}
                  onChange={(event) =>
                    handleDraftChange(
                      "weeklyWorkoutGoal",
                      numberFromInput(event.target.value, draft.weeklyWorkoutGoal),
                    )
                  }
                />
              </label>

              <label className="hh-field">
                <span className="hh-field__label">Hydration goal (oz)</span>
                <input
                  type="number"
                  min="0"
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.hydrationGoal}
                  onChange={(event) =>
                    handleDraftChange(
                      "hydrationGoal",
                      numberFromInput(event.target.value, draft.hydrationGoal),
                    )
                  }
                />
              </label>

              <label className="hh-field">
                <span className="hh-field__label">Sleep target (hours)</span>
                <input
                  type="number"
                  min="0"
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.sleepGoal}
                  onChange={(event) =>
                    handleDraftChange("sleepGoal", numberFromInput(event.target.value, draft.sleepGoal))
                  }
                />
              </label>

              <label className="hh-field">
                <span className="hh-field__label">Meal focus</span>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.mealFocus}
                  onChange={(event) => handleDraftChange("mealFocus", event.target.value)}
                />
              </label>

              <label className="hh-field hh-portal-field--full">
                <span className="hh-field__label">Recovery focus</span>
                <input
                  className="hh-input hh-input--no-icon-left hh-input--no-icon-right"
                  value={draft.recoveryFocus}
                  onChange={(event) => handleDraftChange("recoveryFocus", event.target.value)}
                />
              </label>

              <label className="hh-field hh-portal-field--full">
                <span className="hh-field__label">Coach note</span>
                <textarea
                  className="hh-portal-textarea"
                  value={draft.coachNote}
                  onChange={(event) => handleDraftChange("coachNote", event.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="hh-portal-summary-grid">
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Focus area</span>
                <p className="hh-portal-summary-value">{dashboard.focusArea}</p>
              </div>
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Meal focus</span>
                <p className="hh-portal-summary-value">{dashboard.mealFocus}</p>
              </div>
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Recovery focus</span>
                <p className="hh-portal-summary-value">{dashboard.recoveryFocus}</p>
              </div>
              <div className="hh-portal-summary-item">
                <span className="hh-portal-summary-label">Coach note</span>
                <p className="hh-portal-summary-value">{dashboard.coachNote}</p>
              </div>
            </div>
          )}
        </section>

        <section id="preferences" className="hh-card" style={{ flex: 1 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Preferences
              </h2>
              <p className="hh-portal-card-copy">Training cadence, coaching format, and profile shortcuts.</p>
            </div>
          </div>

          <div className="hh-portal-summary-list">
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Training days</span>
              <div className="hh-portal-chip-row">
                {(isEditing ? draft.trainingDays : dashboard.trainingDays).map((day) => (
                  <span key={day} className="hh-portal-pill">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {isEditing ? (
              <div className="hh-portal-day-picker">
                {WEEK_DAYS.map((day) => {
                  const isSelected = draft.trainingDays.includes(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      className={`hh-portal-day-toggle${isSelected ? " hh-portal-day-toggle--active" : ""}`}
                      onClick={() => toggleTrainingDay(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Coach</span>
              <p className="hh-portal-summary-value">{profile.coachName}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Preferred time</span>
              <p className="hh-portal-summary-value">{dashboard.preferredSessionTime}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Profile</span>
              <p className="hh-portal-summary-value">{profile.city}</p>
            </div>
          </div>
        </section>
      </div>

      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 1 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Profile Snapshot
              </h2>
              <p className="hh-portal-card-copy">Key account details visible to your care team.</p>
            </div>
            <Link href="/profile" className="hh-portal-inline-link">
              Open full profile
            </Link>
          </div>

          <div className="hh-portal-summary-grid">
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Name</span>
              <p className="hh-portal-summary-value">
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Email</span>
              <p className="hh-portal-summary-value">{profile.email}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Phone</span>
              <p className="hh-portal-summary-value">{profile.phone}</p>
            </div>
            <div className="hh-portal-summary-item">
              <span className="hh-portal-summary-label">Goal</span>
              <p className="hh-portal-summary-value">{profile.goal}</p>
            </div>
          </div>
        </section>

        <section className="hh-card" style={{ flex: 1 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>
                Progress Snapshot
              </h2>
              <p className="hh-portal-card-copy">A few targets that change as you edit your dashboard.</p>
            </div>
          </div>

          <div className="hh-portal-progress-grid">
            <div className="hh-portal-progress-stat">
              <span className="hh-portal-summary-label">Goals Met</span>
              <p className="hh-portal-progress-value">
                {dashboard.goalsMet} / {dashboard.goalsTotal}
              </p>
            </div>
            <div className="hh-portal-progress-stat">
              <span className="hh-portal-summary-label">Calories Burned</span>
              <p className="hh-portal-progress-value">{dashboard.caloriesBurned.toLocaleString()}</p>
            </div>
            <div className="hh-portal-progress-stat">
              <span className="hh-portal-summary-label">Weekly Goal</span>
              <p className="hh-portal-progress-value">{dashboard.weeklyWorkoutGoal} sessions</p>
            </div>
          </div>
        </section>
      </div>
    </MemberPortalShell>
  );
}
