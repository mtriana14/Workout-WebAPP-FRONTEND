"use client";

import { useEffect, useState } from "react";
import { DollarSign, Dumbbell } from "lucide-react";

import NavComponent from "@/components/NavComponent";
import { SignOutButton } from "@/app/components/signOutButton";
import { NAV_ITEMS_COACH } from "@/router/router";
import { paymentService } from "@/services/paymentService";

export default function CoachRevenuePage() {
  const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof paymentService.getCoachRevenue>> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRevenue = async () => {
      try {
        const response = await paymentService.getCoachRevenue();
        setRevenue(response);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load coach revenue.");
      }
    };

    void loadRevenue();
  }, []);

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
          <span className="hh-badge hh-badge--sm">Coach Portal</span>
        </div>
        <NavComponent NAV_ITEMS={NAV_ITEMS_COACH} />
        <div className="hh-sidebar__footer">
          <SignOutButton className="hh-sidebar__back hh-sidebar__logout hh-sidebar__logout-button">Sign Out</SignOutButton>
          <a href="/" className="hh-sidebar__back">← Back to Home</a>
        </div>
      </aside>
      <main className="hh-dash-main">
        <div className="hh-dash-content">
          <div>
            <h1 className="hh-page-title">COACH REVENUE</h1>
            <p className="hh-page-subtitle">Subscription earnings from completed payments.</p>
          </div>
          {error ? <p className="hh-error-msg">{error}</p> : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div className="hh-card">
              <DollarSign color="var(--hh-accent)" />
              <p className="hh-card__label">Total Earned</p>
              <p style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>${(revenue?.summary.total_earned ?? 0).toLocaleString()}</p>
            </div>
            <div className="hh-card">
              <p className="hh-card__label">This Month</p>
              <p style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>${(revenue?.summary.this_month ?? 0).toLocaleString()}</p>
            </div>
            <div className="hh-card">
              <p className="hh-card__label">Transactions</p>
              <p style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>{revenue?.count ?? 0}</p>
            </div>
          </div>
          <section className="hh-card">
            <h2 className="hh-panel-heading">Recent Revenue</h2>
            {(revenue?.transactions ?? []).length === 0 ? (
              <p className="hh-text-muted">No completed payments yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {revenue?.transactions.map((transaction) => (
                  <div key={transaction.payment_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--hh-border)", paddingBottom: 10 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700 }}>{transaction.counterparty ?? "Client"}</p>
                      <p style={{ margin: "4px 0 0", color: "var(--hh-text-muted)", fontSize: 13 }}>
                        {transaction.paid_at ? new Date(transaction.paid_at).toLocaleDateString() : "Pending"} · {transaction.status}
                      </p>
                    </div>
                    <strong>${transaction.amount.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
