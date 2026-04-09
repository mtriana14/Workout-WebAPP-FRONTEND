"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, DollarSign, Search, WalletCards } from "lucide-react";

import { AdminPortalShell } from "@/app/components/adminPortalShell";
import {
  fetchAdminPayments,
  fetchAdminPaymentSummary,
  getStoredAuthToken,
  type AdminPaymentRecord,
  type AdminPaymentSummary,
} from "@/app/lib/api";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export default function AdminPaymentsPage() {
  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadPayments() {
    const token = getStoredAuthToken();
    if (!token) {
      setError("Sign in as an admin before loading payments.");
      setIsLoading(false);
      return;
    }

    try {
      setError("");
      setIsLoading(true);
      const [summaryResponse, paymentsResponse] = await Promise.all([
        fetchAdminPaymentSummary(token),
        fetchAdminPayments(token, 1, 50),
      ]);
      setSummary(summaryResponse);
      setPayments(paymentsResponse.payments);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load payments.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return payments;
    }

    return payments.filter((payment) =>
      [
        payment.client_name,
        payment.coach_name,
        payment.status,
        payment.transaction_id ?? "",
      ].some((value) => value.toLowerCase().includes(query)),
    );
  }, [payments, search]);

  const completedTotal = summary?.status_breakdown.find((item) => item.status === "completed")?.total ?? 0;

  return (
    <AdminPortalShell
      activePage="payments"
      title="PAYMENT"
      subtitle="Review revenue, transaction status, and payment history."
    >
      <div className="hh-stats-grid">
        {[
          { label: "Total Revenue", value: money(summary?.total_revenue ?? 0), icon: DollarSign },
          { label: "Transactions", value: summary?.total_transactions ?? payments.length, icon: CreditCard },
          { label: "Completed Value", value: money(completedTotal), icon: WalletCards },
          { label: "Failed Payments", value: summary?.status_breakdown.find((item) => item.status === "failed")?.count ?? 0, icon: CreditCard },
        ].map((card) => (
          <div key={card.label} className="hh-card">
            <div className="hh-card__header">
              <span className="hh-card__label">{card.label}</span>
              <div className="hh-card__icon">
                <card.icon size={16} color="var(--hh-text-muted)" />
              </div>
            </div>
            <p className="hh-card__value">{card.value}</p>
          </div>
        ))}
      </div>

      {error ? <p className="hh-error-msg">{error}</p> : null}

      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 1 }}>
          <h2 className="hh-panel-heading">Status Breakdown</h2>
          {summary?.status_breakdown.length ? (
            <div className="hh-portal-summary-list">
              {summary.status_breakdown.map((item) => (
                <div key={item.status} className="hh-portal-summary-item">
                  <span className="hh-portal-summary-label">{item.status}</span>
                  <p className="hh-portal-summary-value">
                    {item.count} transactions · {money(item.total)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="hh-portal-card-copy">No payment breakdown yet.</p>
          )}
        </section>

        <section className="hh-card" style={{ flex: 2 }}>
          <div className="hh-portal-card-heading">
            <div>
              <h2 className="hh-panel-heading" style={{ marginBottom: 4 }}>Transactions</h2>
              <p className="hh-portal-card-copy">Most recent records from the payments table.</p>
            </div>
          </div>
          <div className="hh-input-wrap" style={{ marginBottom: 16 }}>
            <Search size={16} className="hh-input-wrap__icon" color="var(--hh-text-muted)" />
            <input
              className="hh-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by client, coach, status, or transaction"
            />
          </div>
          {isLoading ? (
            <p className="hh-portal-card-copy">Loading payments from the database...</p>
          ) : filteredPayments.length === 0 ? (
            <p className="hh-portal-card-copy">No payments found. Transactions will appear here after checkout data exists.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredPayments.map((payment) => (
                <div
                  key={payment.payment_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(180px, 1fr) 120px 120px 1fr",
                    gap: 14,
                    padding: "14px 0",
                    borderTop: "1px solid var(--hh-border)",
                  }}
                >
                  <div>
                    <p className="hh-portal-summary-value">{payment.client_name}</p>
                    <p className="hh-portal-card-copy">Coach: {payment.coach_name}</p>
                  </div>
                  <p className="hh-portal-summary-value">{money(payment.amount, payment.currency)}</p>
                  <span className="hh-portal-pill">{payment.status}</span>
                  <p className="hh-portal-card-copy">{payment.transaction_id || "No transaction ID"}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPortalShell>
  );
}
