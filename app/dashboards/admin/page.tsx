"use client";

import {
  Users,
  UserCheck,
  DollarSign,
  ClipboardList
} from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";

const STAT_CARDS = [
  { label: "Total Users",        icon: Users,         value: "12,481",  delta: "↑ +284 this week",  deltaClass: "hh-text-green" },
  { label: "Active Coaches",     icon: UserCheck,     value: "483",     delta: "↑ +12 this month",  deltaClass: "hh-text-green" },
  { label: "Revenue This Month", icon: DollarSign,    value: "$72,300", delta: "↑ +18%",             deltaClass: "hh-text-green" },
  { label: "Pending Approvals",  icon: ClipboardList, value: "2",       delta: "Coach registrations",deltaClass: "hh-text-muted" },
];

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 42000 },
  { month: "Oct", revenue: 48000 },
  { month: "Nov", revenue: 51000 },
  { month: "Dec", revenue: 60000 },
  { month: "Jan", revenue: 68000 },
  { month: "Feb", revenue: 72300 },
];
const maxRevenue = Math.max(...MONTHLY_REVENUE.map((d) => d.revenue));

const ACTIVITY = [
  { text: "Morgan Davis signed up",                  time: "5 min ago"   },
  { text: "Alex Morgan requested Jordan Rivera",     time: "12 min ago"  },
  { text: "Payment received: $149 from Sam Chen",    time: "45 min ago"  },
  { text: "Priya Nair submitted coach verification", time: "1 hour ago"  },
  { text: "Taylor Kim completed 30-day streak",      time: "2 hours ago" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <AdminPortalShell
      activePage="dashboard"
      title="ADMIN DASHBOARD"
      subtitle="Platform overview and management"
    >
          {/* Stat cards */}
          <div className="hh-stats-grid">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                  <div className="hh-card__icon">
                    <card.icon size={16} color="var(--hh-text-muted)" />
                  </div>
                </div>
                <p className="hh-card__value">{card.value}</p>
                <p className={`hh-card__delta ${card.deltaClass}`}>{card.delta}</p>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="hh-bottom-row">

            {/* Revenue chart */}
            <div className="hh-card" style={{ flex: 2 }}>
              <h2 className="hh-panel-heading">Revenue by Month</h2>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 180, gap: 8 }}>
                {MONTHLY_REVENUE.map((bar) => (
                  <div key={bar.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", flex: 1 }}>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: 40,
                          height: `${(bar.revenue / maxRevenue) * 100}%`,
                          background: "var(--hh-accent)",
                          borderRadius: "6px 6px 0 0",
                          minHeight: 8,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "var(--hh-fs-12)", color: "var(--hh-text-muted)" }}>{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="hh-card" style={{ flex: 1 }}>
              <h2 className="hh-panel-heading">Recent Activity</h2>
              <ul className="hh-activity-list">
                {ACTIVITY.map((item, i) => (
                  <li key={i} className="hh-activity-item">
                    <p className="hh-activity-item__text">{item.text}</p>
                    <p className="hh-activity-item__time">{item.time}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
    </AdminPortalShell>
  );
}
