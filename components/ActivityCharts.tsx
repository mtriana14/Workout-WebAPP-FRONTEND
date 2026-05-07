"use client";

import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useState } from "react";

const ACCENT  = "#c084fc";
const GREEN   = "#22c55e";
const ORANGE  = "#f97316";
const BLUE    = "#60a5fa";
const MUTED   = "#6b7280";
const BORDER  = "#2a2a3a";
const BG_DARK = "#13131f";

export type AggregatePeriod = "week" | "month" | "year";

export interface AggregateDay {
  date: string;
  strength_sessions: number;
  cardio_sessions: number;
  cardio_minutes: number;
  steps: number;
  calories: number;
  total_volume: number;
}

export interface AggregateTotals {
  strength_sessions: number;
  cardio_sessions: number;
  cardio_minutes: number;
  total_steps: number;
  total_calories: number;
  active_days: number;
}

interface Props {
  daily: AggregateDay[];
  totals: AggregateTotals;
  period: AggregatePeriod;
  onPeriodChange: (p: AggregatePeriod) => void;
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

const tip = {
  contentStyle: { background: BG_DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#e5e7eb", marginBottom: 4 },
  itemStyle: { color: "#e5e7eb" },
};

function fmt(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityCharts({ daily, totals, period, onPeriodChange, loading }: Props) {
  const chartData = daily.map((d) => ({
    date:     fmt(d.date),
    strength: d.strength_sessions,
    cardio:   d.cardio_sessions,
    minutes:  d.cardio_minutes,
    steps:    d.steps,
    calories: d.calories,
    volume:   Math.round(d.total_volume),
  }));

  if (loading) {
    return <div style={{ color: MUTED, fontSize: 14, padding: "24px 0" }}>Loading charts...</div>;
  }

  const hasData = daily.some((d) => d.strength_sessions + d.cardio_sessions + d.steps + d.calories > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Strength Sessions", value: totals.strength_sessions, color: ACCENT },
          { label: "Cardio Sessions",   value: totals.cardio_sessions,   color: GREEN },
          { label: "Active Days",        value: totals.active_days,       color: ORANGE },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--hh-bg-card-dark)", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--hh-bg-card-dark)", borderRadius: 8, padding: 4, width: "fit-content" }}>
        <PeriodTab label="Week"  active={period === "week"}  onClick={() => onPeriodChange("week")} />
        <PeriodTab label="Month" active={period === "month"} onClick={() => onPeriodChange("month")} />
        <PeriodTab label="Year"  active={period === "year"}  onClick={() => onPeriodChange("year")} />
      </div>

      {!hasData ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: MUTED, fontSize: 14 }}>
          No activity logged for this period.
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Sessions per Day">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} />
                  <Bar dataKey="strength" name="Strength" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={20} stackId="a" />
                  <Bar dataKey="cardio"   name="Cardio"   fill={GREEN}  radius={[4, 4, 0, 0]} maxBarSize={20} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Cardio Minutes">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} formatter={(v: number) => [`${v} min`, "Cardio"]} />
                  <Bar dataKey="minutes" fill={BLUE} radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Calories Logged">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} formatter={(v: number) => [`${v} kcal`, "Calories"]} />
                  <Bar dataKey="calories" fill={ORANGE} radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Steps">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} formatter={(v: number) => [`${v.toLocaleString()}`, "Steps"]} />
                  <Line type="monotone" dataKey="steps" stroke={GREEN} strokeWidth={2} dot={{ fill: GREEN, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
