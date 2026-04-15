"use client";

import { useEffect, useState } from "react";
import NavComponent from "@/components/NavComponent";
import { NAV_ITEMS_ADMIN } from "@/router/router";
import { PaymentRecord, paymentService, PaymentSummary } from "@/services/paymentService";
 
const LOGO_ICON =
  "https://www.figma.com/api/mcp/asset/b62d16c1-9ace-4db9-ac52-c4c34a9bdd3e";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  completed: { bg: "rgba(34, 197, 94, 0.1)",  color: "#22c55e" },
  pending:   { bg: "rgba(234, 179, 8, 0.1)",  color: "#eab308" },
  failed:    { bg: "rgba(239, 68, 68, 0.1)",  color: "#ef4444" },
  refunded:  { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== "all" ? { status: filterStatus } : undefined;
      const data = await paymentService.getAll(params);
      setPayments(data.payments);
      setSummary(data.summary);
    } catch {
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filterStatus]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Calculate percentage change
  const getPercentChange = () => {
    if (!summary || summary.last_month_revenue === 0) return null;
    const change = ((summary.this_month_revenue - summary.last_month_revenue) / summary.last_month_revenue) * 100;
    return change;
  };

  // Filter payments
  const filtered = payments.filter((p) =>
    `${p.client_name} ${p.user_email} ${p.coach_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const percentChange = getPercentChange();

  return (
    <div className="hh-dash-root">
      {/* Sidebar */}
      <aside className="hh-sidebar">
        <div className="hh-sidebar__header">
          <a href="/" className="hh-logo">
            <div className="hh-logo__icon hh-logo__icon--md">
              <img src={LOGO_ICON} alt="" width={16} height={16} />
            </div>
            <span className="hh-logo__text hh-logo__text--md">HeraHealth</span>
          </a>
          <span className="hh-badge hh-badge--sm">Admin Portal</span>
        </div>

        <NavComponent NAV_ITEMS={NAV_ITEMS_ADMIN} />

        <div className="hh-sidebar__footer">
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>

      {/* Main */}
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">PAYMENT DASHBOARD</h1>
            <p className="hh-page-subtitle">Monitor revenue and transaction history</p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {/* Total Revenue */}
              <div className="hh-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Revenue
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0", color: "#22c55e" }}>
                  {formatCurrency(summary.total_revenue)}
                </p>
              </div>

              {/* This Month */}
              <div className="hh-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  This Month
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0" }}>
                  {formatCurrency(summary.this_month_revenue)}
                </p>
                {percentChange !== null && (
                  <p
                    style={{
                      fontSize: 12,
                      margin: "4px 0 0",
                      color: percentChange >= 0 ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {percentChange >= 0 ? "↑" : "↓"} {Math.abs(percentChange).toFixed(1)}% vs last month
                  </p>
                )}
              </div>

              {/* Total Transactions */}
              <div className="hh-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Transactions
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0" }}>
                  {summary.total_transactions}
                </p>
              </div>

              {/* Success Rate */}
              <div className="hh-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: "var(--hh-text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Success Rate
                </p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0" }}>
                  {summary.total_transactions > 0
                    ? ((summary.completed_payments / summary.total_transactions) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          )}

          {/* Status Overview */}
          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {[
                { label: "Completed", value: summary.completed_payments, status: "completed" },
                { label: "Pending", value: summary.pending_payments, status: "pending" },
                { label: "Failed", value: summary.failed_payments, status: "failed" },
                { label: "Last Month", value: formatCurrency(summary.last_month_revenue), status: "refunded" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="hh-card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    border: filterStatus === item.status ? `2px solid ${STATUS_STYLES[item.status].color}` : undefined,
                  }}
                  onClick={() => item.status !== "refunded" && setFilterStatus(item.status === filterStatus ? "all" : item.status)}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: STATUS_STYLES[item.status].bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, color: STATUS_STYLES[item.status].color }}>
                      {typeof item.value === "number" ? item.value : "$"}
                    </span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      {typeof item.value === "number" ? item.value : item.value}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--hh-text-muted)" }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="hh-card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search by user or coach name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="hh-input"
              style={{ flex: 1, maxWidth: 400 }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="hh-input"
              style={{ width: 160 }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="hh-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--hh-border)" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Recent Transactions</h3>
            </div>

            {loading && (
              <p style={{ padding: 24, color: "var(--hh-text-muted)" }}>Loading payments...</p>
            )}
            {error && <p style={{ padding: 24, color: "#ef4444" }}>{error}</p>}
            {!loading && !error && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--hh-border)" }}>
                    {["User", "Coach", "Amount", "Status", "Method", "Date"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--hh-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: 24, color: "var(--hh-text-muted)", textAlign: "center" }}
                      >
                        No payments found.
                      </td>
                    </tr>
                  )}
                  {filtered.map((p) => {
                    const status = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                    return (
                      <tr key={p.payment_id} style={{ borderBottom: "1px solid var(--hh-border)" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{p.client_name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--hh-text-muted)" }}>
                              {p.client_name}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14 }}>{p.coach_name}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600 }}>
                          {formatCurrency(p.amount)}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: status.bg,
                              color: status.color,
                              textTransform: "capitalize",
                            }}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                          {p.payment_method}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--hh-text-muted)" }}>
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}