"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  DollarSign,
  Dumbbell,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { coachService } from "@/services/coachService";
import { exerciseService } from "@/services/exerciseService";
import { paymentService } from "@/services/paymentService";
import { useAuthStore } from "@/store/authStore";
import { NotificationBell } from "@/app/components/NotificationBell";
import { apiClient } from "@/lib/api";

// ── types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalMembers:   number;
  totalCoaches:   number;
  pendingCoaches: number;
  totalExercises: number;
  totalRevenue:   number;
}

interface ReportBucket {
  bucket:       string;
  active_users: number;
  new_signups:  number;
}

interface ActiveUsersReport {
  totals: { total_users: number; active_accounts: number; deactivated: number };
  buckets: ReportBucket[];
}

interface RoleBreakdown {
  by_role: Record<string, { active: number; deactivated: number }>;
}

type ReportPeriod = "daily" | "weekly" | "monthly";

// ── small components ─────────────────────────────────────────────────────────

function StatCard({ label, icon: Icon, value, helper, highlight }: {
  label: string; icon: LucideIcon; value: string; helper: string; highlight?: boolean;
}) {
  return (
    <div className="hh-card">
      <div className="hh-card__header">
        <span className="hh-card__label">{label}</span>
        <div className="hh-card__icon">
          <Icon size={16} color="var(--hh-text-muted)" />
        </div>
      </div>
      <p className="hh-card__value" style={highlight ? { color: "var(--hh-error)" } : undefined}>
        {value}
      </p>
      <p className="hh-card__delta hh-text-muted">{helper}</p>
    </div>
  );
}

function PeriodTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        background: active ? "#c084fc" : "transparent",
        color: active ? "#fff" : "var(--hh-text-muted)",
      }}
    >
      {label}
    </button>
  );
}

const TIP = {
  contentStyle: { background: "#13131f", border: "1px solid #2a2a3a", borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: "#e5e7eb", marginBottom: 4 },
  itemStyle:    { color: "#e5e7eb" },
};

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0, totalCoaches: 0, pendingCoaches: 0,
    totalExercises: 0, totalRevenue: 0,
  });
  const [roleBreakdown, setRoleBreakdown] = useState<Record<string, { active: number; deactivated: number }>>({});
  const [reportBuckets, setReportBuckets] = useState<ReportBucket[]>([]);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("daily");
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingReport, setLoadingReport]   = useState(true);

  // Load stat cards + role breakdown once
  useEffect(() => {
    const load = async () => {
      try {
        const [coachRes, exerciseRes, paymentRes, reportRes, roleRes] = await Promise.allSettled([
          coachService.getAll(),
          exerciseService.getAll(),
          paymentService.getStats(),
          apiClient<ActiveUsersReport>("admin/reports/active-users?period=daily"),
          apiClient<RoleBreakdown>("admin/reports/roles"),
        ]);

        const coaches   = coachRes.status   === "fulfilled" ? (coachRes.value.coaches   ?? []) : [];
        const exercises = exerciseRes.status === "fulfilled" ? (exerciseRes.value.exercises ?? []) : [];
        const revenue   = paymentRes.status  === "fulfilled"
          ? (paymentRes.value.total_revenue ?? paymentRes.value.summary?.total_revenue ?? 0) : 0;
        const totalMembers = reportRes.status === "fulfilled" ? reportRes.value.totals.total_users : 0;

        setStats({
          totalMembers,
          totalCoaches:   coaches.length,
          pendingCoaches: coaches.filter((c) => c.status === "pending").length,
          totalExercises: exercises.length,
          totalRevenue:   revenue,
        });

        if (roleRes.status === "fulfilled") setRoleBreakdown(roleRes.value.by_role ?? {});
        if (reportRes.status === "fulfilled") setReportBuckets(reportRes.value.buckets ?? []);
      } finally {
        setLoadingStats(false);
        setLoadingReport(false);
      }
    };
    void load();
  }, []);

  // Reload chart when period changes
  useEffect(() => {
    setLoadingReport(true);
    apiClient<ActiveUsersReport>(`admin/reports/active-users?period=${reportPeriod}`)
      .then((d) => setReportBuckets(d.buckets ?? []))
      .catch(() => {})
      .finally(() => setLoadingReport(false));
  }, [reportPeriod]);

  const L = loadingStats ? "..." : null;

  const statCards = [
    { label: "Total Members",      icon: Users,        value: L ?? String(stats.totalMembers),                      helper: "Registered accounts on the platform" },
    { label: "Total Coaches",      icon: UserCheck,    value: L ?? String(stats.totalCoaches),                      helper: "Approved and pending coach accounts" },
    { label: "Pending Approvals",  icon: ClipboardList,value: L ?? String(stats.pendingCoaches),                    helper: "Coach registrations awaiting review", highlight: stats.pendingCoaches > 0 },
    { label: "Exercises",          icon: Dumbbell,     value: L ?? String(stats.totalExercises),                    helper: "Exercises available in the library" },
    { label: "Revenue",            icon: DollarSign,   value: L ?? `$${stats.totalRevenue.toLocaleString()}`,       helper: "Total revenue collected" },
  ];

  // Format bucket labels shorter
  const chartData = reportBuckets.map((b) => ({
    ...b,
    label: b.bucket.length > 10 ? b.bucket.slice(5) : b.bucket, // strip year for daily
  }));

  // Role breakdown rows
  const roleRows = Object.entries(roleBreakdown).map(([role, counts]) => ({
    role: role.charAt(0).toUpperCase() + role.slice(1),
    active:      counts.active,
    deactivated: counts.deactivated,
    total:       counts.active + counts.deactivated,
  }));

  return (
    <div className="hh-dash-root">
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">
            Sign Out
          </SignOutButton>
          <a href="/" className="hh-sidebar__back">Back to Home</a>
        </div>
      </aside>

      <main className="hh-dash-main">
        <div className="hh-dash-content">

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 className="hh-page-title">ADMIN DASHBOARD</h1>
              <p className="hh-page-subtitle">
                Welcome back, {user?.first_name ?? user?.name ?? "Admin"}.
              </p>
            </div>
            {(user?.id ?? user?.user_id) && (
              <NotificationBell userId={Number(user?.id ?? user?.user_id)} />
            )}
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            {statCards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          {/* Quick actions + role breakdown */}
          <div className="hh-bottom-row">
            <div className="hh-card" style={{ flex: 2 }}>
              <h2 className="hh-panel-heading">Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                <a href="/dashboards/admin/coaches"   className="hh-nav-link">Manage Coaches</a>
                <a href="/dashboards/admin/exercises" className="hh-nav-link">Review Exercises</a>
                <a href="/dashboards/admin/payments"  className="hh-nav-link">View Payments</a>
                <a href="/dashboards/admin/users"     className="hh-nav-link">Manage Users</a>
              </div>
            </div>

            <div className="hh-card" style={{ flex: 1 }}>
              <h2 className="hh-panel-heading">Members by Role</h2>
              {loadingStats ? (
                <p className="hh-text-muted" style={{ fontSize: 13 }}>Loading...</p>
              ) : roleRows.length === 0 ? (
                <p className="hh-text-muted" style={{ fontSize: 13 }}>No data available.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  {roleRows.map(({ role, active, deactivated, total }) => (
                    <div key={role}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{role}</span>
                        <span style={{ fontSize: 13, color: "var(--hh-text-muted)" }}>{total} total</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, fontSize: 11, color: "var(--hh-text-muted)" }}>
                        <span style={{ color: "#22c55e" }}>● {active} active</span>
                        {deactivated > 0 && <span style={{ color: "var(--hh-error)" }}>● {deactivated} inactive</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UC 22 — User activity report */}
          <div className="hh-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 className="hh-panel-heading" style={{ margin: 0 }}>Platform Activity</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--hh-text-muted)" }}>
                  Active users and new signups over time
                </p>
              </div>
              <div style={{ display: "flex", gap: 4, background: "var(--hh-bg-card-dark)", borderRadius: 8, padding: 4 }}>
                <PeriodTab label="Daily"   active={reportPeriod === "daily"}   onClick={() => setReportPeriod("daily")} />
                <PeriodTab label="Weekly"  active={reportPeriod === "weekly"}  onClick={() => setReportPeriod("weekly")} />
                <PeriodTab label="Monthly" active={reportPeriod === "monthly"} onClick={() => setReportPeriod("monthly")} />
              </div>
            </div>

            {loadingReport ? (
              <p style={{ color: "var(--hh-text-muted)", fontSize: 13 }}>Loading...</p>
            ) : chartData.length === 0 ? (
              <p style={{ color: "var(--hh-text-muted)", fontSize: 13 }}>No activity data for this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...TIP} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="active_users" name="Active Users" fill="#c084fc" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="new_signups"  name="New Signups"  fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
