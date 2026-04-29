"use client";

import Link from "next/link";

import { MemberPortalShell } from "@/app/components/memberPortalShell";

export default function WeeklyCalendarPage() {
  return (
    <MemberPortalShell activePage="calendar" title="WEEKLY CALENDAR" subtitle="Quick access to your role-specific weekly schedule.">
      <div className="hh-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 840 }}>
        <Link className="btn btn--primary" href="/dashboards/coach/schedule">Coach Weekly Calendar</Link>
        <Link className="btn btn--ghost" href="/dashboards/client/workouts" style={{ border: "1px solid var(--hh-border)" }}>Client Workout Calendar</Link>
      </div>
    </MemberPortalShell>
  );
}
