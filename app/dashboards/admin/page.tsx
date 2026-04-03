"use client";

import Link from "next/link";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON      = "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";
const NAV_DASHBOARD  = "https://www.figma.com/api/mcp/asset/4a444b5a-55d6-47fd-90bc-2a0c522b40b4";
const NAV_USERS      = "https://www.figma.com/api/mcp/asset/c8b2bcee-a404-442c-ba16-e64f05751f1c";
const NAV_COACHES    = "https://www.figma.com/api/mcp/asset/90ad0f31-6602-4207-983a-74694eab3e30";
const NAV_EXERCISE   = "https://www.figma.com/api/mcp/asset/66986bb5-e372-40a1-8ae8-510ada58004f";
const NAV_PAYMENT    = "https://www.figma.com/api/mcp/asset/1f6854ee-fd37-467a-a9cf-f702637b4972";
const NAV_NOTIF      = "https://www.figma.com/api/mcp/asset/6f6a281c-bc69-4c6f-aa8c-8be330657de2";
const STAT_USERS     = "https://www.figma.com/api/mcp/asset/4d2ec166-f552-49fb-bd85-d466b31b6805";
const STAT_COACHES   = "https://www.figma.com/api/mcp/asset/e011f632-a5e6-44a4-8878-d9895f77cac9";
const STAT_REVENUE   = "https://www.figma.com/api/mcp/asset/ab73894b-06de-45ff-88ed-3b037e6b9ba9";
const STAT_APPROVALS = "https://www.figma.com/api/mcp/asset/09bf652a-e430-452b-bbed-34bef690339b";
const BAR_SEP        = "https://www.figma.com/api/mcp/asset/d486c73c-2abd-4cce-b0c7-f847b7dfb206";
const BAR_OCT        = "https://www.figma.com/api/mcp/asset/b8556d83-3158-4977-827e-6610705ef618";
const BAR_NOV        = "https://www.figma.com/api/mcp/asset/5f341f7b-a847-46da-9ecd-8370d18a9d52";
const BAR_DEC        = "https://www.figma.com/api/mcp/asset/8702b752-e3db-4bc0-8ac1-039444d07f02";
const BAR_JAN        = "https://www.figma.com/api/mcp/asset/8ce443c6-34c0-47ca-8a24-3b6b1830da92";
const BAR_FEB        = "https://www.figma.com/api/mcp/asset/e5a864cc-e4e4-4092-aa3c-db4f7eb26338";

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",     icon: NAV_DASHBOARD, href: "/dashboards/admin", active: true  },
  { label: "Users",         icon: NAV_USERS,     href: "/admin/users",      active: false },
  { label: "Coaches",       icon: NAV_COACHES,   href: "/admin/coaches",    active: false },
  { label: "Exercise DB",   icon: NAV_EXERCISE,  href: "/admin/exercises",  active: false },
  { label: "Payment",       icon: NAV_PAYMENT,   href: "/admin/payments",   active: false },
  { label: "Notifications", icon: NAV_NOTIF,     href: "/admin/notifications", active: false },
];

const STAT_CARDS = [
  { label: "Total Users",        icon: STAT_USERS,     value: "12,481",  delta: "↑ +284 this week",  deltaClass: "hh-text-green" },
  { label: "Active Coaches",     icon: STAT_COACHES,   value: "483",     delta: "↑ +12 this month",  deltaClass: "hh-text-green" },
  { label: "Revenue This Month", icon: STAT_REVENUE,   value: "$72,300", delta: "↑ +18%",             deltaClass: "hh-text-green" },
  { label: "Pending Approvals",  icon: STAT_APPROVALS, value: "2",       delta: "Coach registrations",deltaClass: "hh-text-muted" },
];

const CHART_BARS = [
  { month: "Sep", img: BAR_SEP },
  { month: "Oct", img: BAR_OCT },
  { month: "Nov", img: BAR_NOV },
  { month: "Dec", img: BAR_DEC },
  { month: "Jan", img: BAR_JAN },
  { month: "Feb", img: BAR_FEB },
];

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
    <div className="hh-dash-root">

      {/* ── SIDEBAR ── */}
      <aside className="hh-sidebar">

        <div className="hh-sidebar__header">
          <Link href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </Link>
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <nav className="hh-sidebar__nav" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`hh-nav-link${item.active ? " hh-nav-link--active" : ""}`}
              aria-current={item.active ? "page" : undefined}
            >
              <img src={item.icon} alt="" width={16} height={16} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hh-sidebar__footer">
          <Link href="/" className="hh-sidebar__back">← Back to Home</Link>
        </div>

      </aside>

      {/* ── MAIN ── */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">

          {/* Page heading */}
          <div>
            <h1 className="hh-page-title">ADMIN DASHBOARD</h1>
            <p className="hh-page-subtitle">Platform overview and management</p>
          </div>

          {/* Stat cards */}
          <div className="hh-stats-grid">
            {STAT_CARDS.map((card) => (
              <div key={card.label} className="hh-card">
                <div className="hh-card__header">
                  <span className="hh-card__label">{card.label}</span>
                  <div className="hh-card__icon">
                    <img src={card.icon} alt="" width={16} height={16} />
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
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 8, height: 200 }}>
                {CHART_BARS.map((bar) => (
                  <div key={bar.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", flex: 1 }}>
                      <img src={bar.img} alt={`Revenue for ${bar.month}`} style={{ width: "100%", maxWidth: 40, height: "auto", objectFit: "contain", objectPosition: "bottom" }} />
                    </div>
                    <span style={{ fontFamily: "var(--hh-font-body)", fontSize: 12, color: "var(--hh-text-muted)", textAlign: "center" }}>{bar.month}</span>
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
        </div>
      </main>

    </div>
  );
}
