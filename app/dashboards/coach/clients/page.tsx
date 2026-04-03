"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     href: "/dashboards/coach",          active: false },
  { label: "My Clients",    href: "/dashboards/coach/clients",  active: true  },
  { label: "Workout Plans", href: "/dashboards/coach/workouts", active: false },
  { label: "Meal Plans",    href: "/dashboards/coach/meals",    active: false },
  { label: "Schedule",      href: "/dashboards/coach/schedule", active: false },
  { label: "Chat",          href: "/dashboards/coach/chat",     active: false },
  { label: "Profile",       href: "/dashboards/coach/profile",  active: false },
  { label: "Settings",      href: "/dashboards/coach/settings", active: false },
];

const MOCK_CLIENTS = [
  {
    id: "1", name: "Alex Morgan",   goal: "Build Muscle",       lastActive: "2h ago", progress: 72,
    weightData:   [185, 183, 182, 181, 180, 179, 178],
    workoutsData: [4, 5, 3, 5, 4, 5, 4],
    caloriesData: [2100, 2300, 1900, 2400, 2200, 2350, 2100],
    weeklyActivity: [320, 0, 480, 560, 0, 640, 0],
  },
  {
    id: "2", name: "Sam Chen",      goal: "Lose Weight",        lastActive: "1d ago", progress: 45,
    weightData:   [210, 208, 207, 205, 204, 202, 201],
    workoutsData: [2, 3, 2, 3, 2, 3, 2],
    caloriesData: [1800, 1750, 1900, 1700, 1800, 1650, 1700],
    weeklyActivity: [200, 300, 0, 250, 310, 0, 180],
  },
  {
    id: "3", name: "Taylor Kim",    goal: "Run a 5K",           lastActive: "3h ago", progress: 88,
    weightData:   [155, 154, 154, 153, 152, 152, 151],
    workoutsData: [5, 5, 4, 5, 5, 4, 5],
    caloriesData: [2000, 2100, 2050, 2200, 2100, 2000, 2150],
    weeklyActivity: [400, 420, 380, 0, 450, 400, 0],
  },
  {
    id: "4", name: "Morgan Davis",  goal: "Improve Endurance",  lastActive: "5h ago", progress: 60,
    weightData:   [170, 170, 169, 168, 168, 167, 166],
    workoutsData: [3, 3, 4, 3, 4, 3, 4],
    caloriesData: [2200, 2100, 2300, 2150, 2250, 2100, 2200],
    weeklyActivity: [350, 0, 420, 380, 0, 500, 320],
  },
];

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];

type GraphType = "weight" | "workouts" | "calories" | "activity";

function LineGraph({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 80;
  const padX = 4;
  const padY = 8;

  const points = data.map((val, i) => {
    const x = padX + (i / (data.length - 1)) * (width - padX * 2);
    const y = padY + ((max - val) / range) * (height - padY * 2);
    return `${x},${y}`;
  });

  const pointsStr = points.join(" ");
  const firstPoint = points[0].split(",");
  const lastPoint = points[points.length - 1].split(",");

  const fillPoints = [
    `${firstPoint[0]},${height}`,
    ...points,
    `${lastPoint[0]},${height}`,
  ].join(" ");

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 80 }}>
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPoints} fill={`url(#grad-${color.replace("#", "")})`} />
        <polyline points={pointsStr} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((_, i) => {
          const [x, y] = points[i].split(",");
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {labels.map((l) => (
          <span key={l} style={{ fontSize: 9, color: "var(--hh-text-muted)" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function BarGraph({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const max = Math.max(...data) || 1;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", height: 80, gap: 4 }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{
              width: "100%",
              height: val > 0 ? `${(val / max) * 100}%` : 4,
              background: val > 0 ? color : "var(--hh-bg-card-dark)",
              borderRadius: "3px 3px 0 0",
              minHeight: 4,
              opacity: val > 0 ? 1 : 0.3,
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {labels.map((l) => (
          <span key={l} style={{ fontSize: 9, color: "var(--hh-text-muted)", flex: 1, textAlign: "center" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function CoachClients() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeGraph, setActiveGraph] = useState<GraphType>("activity");
  const client = MOCK_CLIENTS.find((c) => c.id === selectedId);

  const GRAPH_TABS: { key: GraphType; label: string }[] = [
    { key: "activity",  label: "Calories Burned" },
    { key: "weight",    label: "Weight"          },
    { key: "workouts",  label: "Workouts/Week"   },
    { key: "calories",  label: "Calorie Intake"  },
  ];

  return (
    <div className="hh-dash-root">

      {/* SIDEBAR */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <Dumbbell size={16} color="white" />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="Coach navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={"hh-nav-link" + (item.active ? " hh-nav-link--active" : "")}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">

          <div>
            <h1 className="hh-page-title">MY CLIENTS</h1>
            <p className="hh-page-subtitle">{MOCK_CLIENTS.length} active clients</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--hh-sp-24)" }}>

            {/* Client list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {MOCK_CLIENTS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setActiveGraph("activity"); }}
                  className="hh-card"
                  style={{
                    cursor: "pointer",
                    borderColor: selectedId === c.id ? "var(--hh-accent)" : undefined,
                    background: selectedId === c.id ? "var(--hh-accent-15)" : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "var(--hh-bg-card-dark)", border: "1px solid var(--hh-border)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-16)",
                      fontWeight: 700, color: "var(--hh-accent-light)",
                    }}>
                      {c.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "var(--hh-fs-14)", fontWeight: 600, color: "var(--hh-text-primary)" }}>{c.name}</div>
                      <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{c.goal}</div>
                    </div>
                    <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{c.lastActive}</div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)", marginBottom: 4 }}>
                      <span>Progress</span><span>{c.progress}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--hh-bg-card-dark)", borderRadius: 9999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${c.progress}%`, background: "var(--hh-accent)", borderRadius: 9999 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Client detail */}
            <div>
              {client ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--hh-sp-16)" }}>

                  {/* Client info */}
                  <div className="hh-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--hh-bg-card-dark)", border: "1px solid var(--hh-border)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-22)",
                        fontWeight: 700, color: "var(--hh-accent-light)",
                      }}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-22)", fontWeight: 800, color: "var(--hh-text-primary)" }}>
                          {client.name}
                        </h3>
                        <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)" }}>
                          Goal: {client.goal} · Last active: {client.lastActive}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 16, textAlign: "center", padding: 16,
                      borderRadius: "var(--hh-radius-md)", background: "var(--hh-bg-card-dark)",
                    }}>
                      {[
                        { val: "23",              label: "Workouts"   },
                        { val: `${client.progress}%`, label: "Progress"  },
                        { val: "12",              label: "Day Streak" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontFamily: "var(--hh-font-display)", fontSize: "var(--hh-fs-22)", fontWeight: 800, color: "var(--hh-text-primary)" }}>{s.val}</div>
                          <div style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress graphs */}
                  <div className="hh-card">
                    <h4 className="hh-panel-heading">Progress Graphs</h4>

                    {/* Graph tabs */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
                      {GRAPH_TABS.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveGraph(tab.key)}
                          style={{
                            padding: "5px 12px", borderRadius: "var(--hh-radius-full)",
                            fontSize: "var(--hh-fs-12)", fontWeight: 500,
                            border: "1px solid",
                            cursor: "pointer", fontFamily: "var(--hh-font-body)",
                            borderColor: activeGraph === tab.key ? "var(--hh-accent)" : "var(--hh-border)",
                            background: activeGraph === tab.key ? "var(--hh-accent-20)" : "transparent",
                            color: activeGraph === tab.key ? "var(--hh-accent-light)" : "var(--hh-text-muted)",
                            transition: "all 0.15s",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Graph display */}
                    {activeGraph === "activity" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Calories burned per session this week</span>
                          <span style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, color: "var(--hh-accent-light)" }}>
                            {client.weeklyActivity.reduce((a, b) => a + b, 0)} total
                          </span>
                        </div>
                        <BarGraph data={client.weeklyActivity} color="var(--hh-accent)" labels={WEEK_LABELS} />
                      </>
                    )}

                    {activeGraph === "weight" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Weight (lbs) over 7 weeks</span>
                          <span style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, color: "#4ade80" }}>
                            ↓ {client.weightData[0] - client.weightData[client.weightData.length - 1]} lbs
                          </span>
                        </div>
                        <LineGraph data={client.weightData} color="#4ade80" labels={MONTH_LABELS} />
                      </>
                    )}

                    {activeGraph === "workouts" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Workouts completed per week</span>
                          <span style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, color: "var(--hh-accent-light)" }}>
                            avg {(client.workoutsData.reduce((a, b) => a + b, 0) / client.workoutsData.length).toFixed(1)}/wk
                          </span>
                        </div>
                        <BarGraph data={client.workoutsData} color="var(--hh-accent)" labels={MONTH_LABELS} />
                      </>
                    )}

                    {activeGraph === "calories" && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>Daily calorie intake over 7 weeks</span>
                          <span style={{ fontSize: "var(--hh-fs-12)", fontWeight: 600, color: "#f59e0b" }}>
                            avg {Math.round(client.caloriesData.reduce((a, b) => a + b, 0) / client.caloriesData.length)} kcal
                          </span>
                        </div>
                        <LineGraph data={client.caloriesData} color="#f59e0b" labels={MONTH_LABELS} />
                      </>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="hh-card">
                    <h4 className="hh-panel-heading">Quick Actions</h4>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <a
                        href="/dashboards/coach/workouts"
                        className="btn btn--primary"
                        style={{ fontSize: "var(--hh-fs-12)" }}
                      >
                        Create Workout Plan
                      </a>
                      <a
                        href="/dashboards/coach/meals"
                        className="btn btn--ghost"
                        style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}
                      >
                        Create Meal Plan
                      </a>
                      <a
                        href="/dashboards/coach/chat"
                        className="btn btn--ghost"
                        style={{ border: "1px solid var(--hh-border)", fontSize: "var(--hh-fs-12)" }}
                      >
                        Message Client
                      </a>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="hh-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 192 }}>
                  <p style={{ fontSize: "var(--hh-fs-14)", color: "var(--hh-text-muted)" }}>Select a client to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
