"use client";

// ─── Figma Asset URLs ─────────────────────────────────────────────────────────
const LOGO_ICON       = "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";
const NAV_DASHBOARD   = "https://www.figma.com/api/mcp/asset/4a444b5a-55d6-47fd-90bc-2a0c522b40b4";
const NAV_USERS       = "https://www.figma.com/api/mcp/asset/c8b2bcee-a404-442c-ba16-e64f05751f1c";
const NAV_COACHES     = "https://www.figma.com/api/mcp/asset/90ad0f31-6602-4207-983a-74694eab3e30";
const NAV_EXERCISE    = "https://www.figma.com/api/mcp/asset/66986bb5-e372-40a1-8ae8-510ada58004f";
const NAV_PAYMENT     = "https://www.figma.com/api/mcp/asset/1f6854ee-fd37-467a-a9cf-f702637b4972";
const NAV_NOTIF       = "https://www.figma.com/api/mcp/asset/6f6a281c-bc69-4c6f-aa8c-8be330657de2";
const STAT_USERS      = "https://www.figma.com/api/mcp/asset/4d2ec166-f552-49fb-bd85-d466b31b6805";
const STAT_COACHES    = "https://www.figma.com/api/mcp/asset/e011f632-a5e6-44a4-8878-d9895f77cac9";
const STAT_REVENUE    = "https://www.figma.com/api/mcp/asset/ab73894b-06de-45ff-88ed-3b037e6b9ba9";
const STAT_APPROVALS  = "https://www.figma.com/api/mcp/asset/09bf652a-e430-452b-bbed-34bef690339b";
// Chart bar assets (Sep → Feb)
const BAR_SEP = "https://www.figma.com/api/mcp/asset/d486c73c-2abd-4cce-b0c7-f847b7dfb206";
const BAR_OCT = "https://www.figma.com/api/mcp/asset/b8556d83-3158-4977-827e-6610705ef618";
const BAR_NOV = "https://www.figma.com/api/mcp/asset/5f341f7b-a847-46da-9ecd-8370d18a9d52";
const BAR_DEC = "https://www.figma.com/api/mcp/asset/8702b752-e3db-4bc0-8ac1-039444d07f02";
const BAR_JAN = "https://www.figma.com/api/mcp/asset/8ce443c6-34c0-47ca-8a24-3b6b1830da92";
const BAR_FEB = "https://www.figma.com/api/mcp/asset/e5a864cc-e4e4-4092-aa3c-db4f7eb26338";

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",   icon: NAV_DASHBOARD, href: "/admin/dashboard", active: true  },
  { label: "Users",       icon: NAV_USERS,     href: "/admin/users",     active: false },
  { label: "Coaches",     icon: NAV_COACHES,   href: "/admin/coaches",   active: false },
  { label: "Exercise DB", icon: NAV_EXERCISE,  href: "/admin/exercises", active: false },
  { label: "Payment",     icon: NAV_PAYMENT,   href: "/admin/payments",  active: false },
  { label: "Notifications", icon: NAV_NOTIF,   href: "/admin/notifications", active: false },
];

const STAT_CARDS = [
  { label: "Total Users",          icon: STAT_USERS,     value: "12,481", delta: "↑ +284 this week",       deltaColor: "#4ade80" },
  { label: "Active Coaches",       icon: STAT_COACHES,   value: "483",    delta: "↑ +12 this month",       deltaColor: "#4ade80" },
  { label: "Revenue This Month",   icon: STAT_REVENUE,   value: "$72,300",delta: "↑ +18%",                 deltaColor: "#4ade80" },
  { label: "Pending Approvals",    icon: STAT_APPROVALS, value: "2",      delta: "Coach registrations",    deltaColor: "#898994" },
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
  { text: "Morgan Davis signed up",                   time: "5 min ago"   },
  { text: "Alex Morgan requested Jordan Rivera",      time: "12 min ago"  },
  { text: "Payment received: $149 from Sam Chen",     time: "45 min ago"  },
  { text: "Priya Nair submitted coach verification",  time: "1 hour ago"  },
  { text: "Taylor Kim completed 30-day streak",       time: "2 hours ago" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        :root {
          --color-bg:           #111113;
          --color-sidebar:      #1b1b1d;
          --color-card:         #1b1b1d;
          --color-border:       #2c2c30;
          --color-border-50:    rgba(44,44,48,0.5);
          --color-text-primary: #f5f5f5;
          --color-text-muted:   #898994;
          --color-accent:       #915985;
          --color-accent-15:    rgba(145,89,133,0.15);
          --color-accent-20:    rgba(145,89,133,0.2);
          --color-accent-30:    rgba(145,89,133,0.3);
          --color-accent-light: #ab87a3;
          --color-green:        #4ade80;
          --font-body:    'Inter', sans-serif;
          --font-display: 'Barlow Condensed', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #__next { height: 100%; }
        body {
          font-family: var(--font-body);
          background: var(--color-bg);
          color: var(--color-text-primary);
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; color: inherit; }

        /* Nav link hover */
        .ad-nav-link:hover {
          background: rgba(145,89,133,0.1);
        }

        /* Stat card hover */
        .ad-stat-card:hover {
          border-color: rgba(145,89,133,0.4) !important;
        }

        /* Scrollable main */
        .ad-main { overflow-y: auto; }

        /* Responsive */
        @media (max-width: 1024px) {
          .ad-sidebar { width: 180px !important; }
          .ad-stats   { grid-template-columns: repeat(2, 1fr) !important; }
          .ad-bottom  { flex-direction: column !important; }
          .ad-chart-panel { width: 100% !important; }
          .ad-activity-panel { width: 100% !important; }
        }
        @media (max-width: 768px) {
          .ad-sidebar { display: none !important; }
          .ad-content { padding: 20px 16px !important; }
          .ad-stats   { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={S.root}>

        {/* ── SIDEBAR ── */}
        <aside className="ad-sidebar" style={S.sidebar}>

          {/* Logo + badge */}
          <div style={S.sidebarHeader}>
            <a href="/" style={S.logoLink}>
              <div style={S.logoIcon}>
                <img src={LOGO_ICON} alt="" width={16} height={16} />
              </div>
              <span style={S.logoText}>HeraHealth</span>
            </a>
            <div style={S.adminBadge}>
              <span style={S.adminBadgeText}>Admin Portal</span>
            </div>
          </div>

          {/* Nav links */}
          <nav style={S.nav} aria-label="Admin navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="ad-nav-link"
                style={{
                  ...S.navLink,
                  ...(item.active ? S.navLinkActive : {}),
                }}
                aria-current={item.active ? "page" : undefined}
              >
                <img src={item.icon} alt="" width={16} height={16} style={{ flexShrink: 0 }} />
                <span style={{
                  ...S.navLinkText,
                  color: item.active ? "#ab87a3" : "#898994",
                }}>
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          {/* Back to Home */}
          <div style={S.sidebarFooter}>
            <a href="/" style={S.backLink}>← Back to Home</a>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <main className="ad-main" style={S.main}>
          <div className="ad-content" style={S.content}>

            {/* Page heading */}
            <div style={S.pageHeading}>
              <h1 style={S.pageTitle}>ADMIN DASHBOARD</h1>
              <p style={S.pageSubtitle}>Platform overview and management</p>
            </div>

            {/* Stat cards */}
            <div className="ad-stats" style={S.statsGrid}>
              {STAT_CARDS.map((card) => (
                <div key={card.label} className="ad-stat-card" style={S.statCard}>
                  <div style={S.statCardHeader}>
                    <span style={S.statCardLabel}>{card.label}</span>
                    <div style={S.statCardIconWrap}>
                      <img src={card.icon} alt="" width={16} height={16} />
                    </div>
                  </div>
                  <div style={S.statCardBody}>
                    <span style={S.statCardValue}>{card.value}</span>
                    <span style={{ ...S.statCardDelta, color: card.deltaColor }}>
                      {card.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom row: chart + activity */}
            <div className="ad-bottom" style={S.bottomRow}>

              {/* Revenue chart */}
              <div className="ad-chart-panel" style={S.panel}>
                <h2 style={S.panelHeading}>Revenue by Month</h2>
                <div style={S.chartArea}>
                  {CHART_BARS.map((bar) => (
                    <div key={bar.month} style={S.chartBarCol}>
                      <div style={S.chartBarWrap}>
                        <img
                          src={bar.img}
                          alt={`Revenue bar for ${bar.month}`}
                          style={S.chartBarImg}
                        />
                      </div>
                      <span style={S.chartLabel}>{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="ad-activity-panel" style={{ ...S.panel, ...S.activityPanel }}>
                <h2 style={S.panelHeading}>Recent Activity</h2>
                <ul style={S.activityList}>
                  {ACTIVITY.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        ...S.activityItem,
                        borderBottom: i < ACTIVITY.length - 1
                          ? "0.6px solid rgba(44,44,48,0.5)"
                          : "none",
                      }}
                    >
                      <p style={S.activityText}>{item.text}</p>
                      <p style={S.activityTime}>{item.time}</p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </main>

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {

  root: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    background: "#111113",
    fontFamily: "'Inter', sans-serif",
  },

  /* Sidebar */
  sidebar: {
    width: 224,
    flexShrink: 0,
    background: "#1b1b1d",
    borderRight: "0.6px solid #2c2c30",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "20px 16px 20.6px",
    borderBottom: "0.6px solid #2c2c30",
  },
  logoLink: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: "#915985",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 18,
    lineHeight: "28px",
    letterSpacing: "0.9px",
    color: "#f5f5f5",
    whiteSpace: "nowrap",
  },
  adminBadge: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(145,89,133,0.2)",
    border: "1px solid rgba(145,89,133,0.3)",
    borderRadius: 9999,
    padding: "4.6px 12.6px",
    alignSelf: "flex-start",
  },
  adminBadgeText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: 10,
    lineHeight: "16px",
    color: "#ab87a3",
    whiteSpace: "nowrap",
  },

  /* Nav */
  nav: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "16px 12px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    transition: "background 0.15s",
    cursor: "pointer",
  },
  navLinkActive: {
    background: "rgba(145,89,133,0.2)",
    borderLeft: "1.8px solid #915985",
    paddingLeft: "10.2px",
  },
  navLinkText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "20px",
    whiteSpace: "nowrap",
  },

  /* Sidebar footer */
  sidebarFooter: {
    borderTop: "0.6px solid #2c2c30",
    padding: "16.6px 16px 16px",
  },
  backLink: {
    display: "block",
    padding: "10px 12px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "16px",
    color: "#898994",
    borderRadius: 12,
    cursor: "pointer",
  },

  /* Main */
  main: {
    flex: 1,
    minWidth: 0,
    background: "#111113",
  },
  content: {
    maxWidth: 1280,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  /* Page heading */
  pageHeading: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  pageTitle: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 30,
    lineHeight: "36px",
    letterSpacing: "0.75px",
    color: "#f5f5f5",
  },
  pageSubtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "20px",
    color: "#898994",
  },

  /* Stat cards */
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  statCard: {
    background: "#1b1b1d",
    border: "1px solid #2c2c30",
    borderRadius: 12,
    padding: "24.6px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "border-color 0.2s",
  },
  statCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statCardLabel: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "20px",
    color: "#898994",
    whiteSpace: "nowrap",
  },
  statCardIconWrap: {
    width: 32,
    height: 32,
    background: "rgba(145,89,133,0.15)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statCardBody: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statCardValue: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 30,
    lineHeight: "36px",
    letterSpacing: "-0.75px",
    color: "#f5f5f5",
  },
  statCardDelta: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: "16px",
  },

  /* Bottom row */
  bottomRow: {
    display: "flex",
    gap: 24,
    alignItems: "stretch",
  },

  /* Shared panel */
  panel: {
    background: "#1b1b1d",
    border: "1px solid #2c2c30",
    borderRadius: 12,
    padding: "24.6px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flex: "2 1 0",
  },
  activityPanel: {
    flex: "1 1 0",
  },
  panelHeading: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 600,
    fontSize: 16,
    lineHeight: "24px",
    letterSpacing: "0.16px",
    color: "#f5f5f5",
  },

  /* Chart */
  chartArea: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
    height: 200,
    paddingBottom: 4,
  },
  chartBarCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBarWrap: {
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    flex: 1,
  },
  chartBarImg: {
    width: "100%",
    maxWidth: 40,
    height: "auto",
    display: "block",
    objectFit: "contain",
    objectPosition: "bottom",
  },
  chartLabel: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "16px",
    color: "#898994",
    textAlign: "center" as const,
  },

  /* Activity */
  activityList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  activityItem: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    padding: "8px 0 8.6px",
  },
  activityText: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "20px",
    color: "#f5f5f5",
  },
  activityTime: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "16px",
    color: "#898994",
  },
};