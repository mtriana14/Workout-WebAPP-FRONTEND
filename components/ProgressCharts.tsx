"use client";

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";
import type { ProgressEntry } from "@/services/progressService";

const ACCENT   = "#c084fc";
const GREEN    = "#22c55e";
const ORANGE   = "#f97316";
const MUTED    = "#6b7280";
const BORDER   = "#2a2a3a";
const BG_DARK  = "#13131f";

type Period = "7" | "30" | "all";

interface Props {
  entries: ProgressEntry[];
  loading?: boolean;
}

function PeriodTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 14px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        background: active ? ACCENT : "transparent",
        color: active ? "#fff" : MUTED,
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--hh-bg-card)",
      border: "1px solid var(--hh-border)",
      borderRadius: 12,
      padding: "20px 16px 12px",
    }}>
      <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "var(--hh-text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: BG_DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#e5e7eb", marginBottom: 4 },
  itemStyle: { color: "#e5e7eb" },
};

export default function ProgressCharts({ entries, loading }: Props) {
  const [period, setPeriod] = useState<Period>("30");

  const data = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
    const cutoff = period === "all" ? null : new Date();
    if (cutoff) cutoff.setDate(cutoff.getDate() - Number(period) + 1);

    return sorted
      .filter((e) => !cutoff || new Date(e.entry_date) >= cutoff)
      .map((e) => ({
        date:      new Date(`${e.entry_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight:    e.weight,
        calories:  e.calories_burned,
        workouts:  e.workouts_completed,
        goal:      e.goal_completed ? 1 : 0,
      }));
  }, [entries, period]);

  const weightData  = useMemo(() => data.filter((d) => d.weight !== null), [data]);
  const hasWeight   = weightData.length > 0;
  const hasActivity = data.some((d) => d.calories > 0 || d.workouts > 0);

  if (loading) {
    return <div style={{ color: MUTED, fontSize: 14, padding: "24px 0" }}>Loading charts...</div>;
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: MUTED, fontSize: 14 }}>
        Log some progress entries to see your charts here.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Period tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--hh-bg-card-dark)", borderRadius: 8, padding: 4, width: "fit-content" }}>
        <PeriodTab label="7 days"  active={period === "7"}   onClick={() => setPeriod("7")} />
        <PeriodTab label="30 days" active={period === "30"}  onClick={() => setPeriod("30")} />
        <PeriodTab label="All"     active={period === "all"} onClick={() => setPeriod("all")} />
      </div>

      {/* Weight trend */}
      {hasWeight ? (
        <ChartCard title="Weight (lb)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
              <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} lb`, "Weight"]} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={ACCENT}
                strokeWidth={2}
                dot={{ fill: ACCENT, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}

      {/* Calories + workouts side by side */}
      {hasActivity ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ChartCard title="Calories Burned">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kcal`, "Calories"]} />
                <Bar dataKey="calories" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Workouts Completed">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Workouts"]} />
                <Bar dataKey="workouts" fill={GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      ) : null}

      {/* Goal completion rate bar */}
      {data.length > 0 ? (
        <ChartCard title="Daily Goal Completion">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} domain={[0, 1]} tickCount={2} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v === 1 ? "Yes" : "No", "Goal Met"]} />
              <Bar dataKey="goal" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      ) : null}
    </div>
  );
}
