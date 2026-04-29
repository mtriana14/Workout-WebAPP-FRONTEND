"use client";

import { useEffect, useState } from "react";

import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { billingService, type Invoice } from "@/services/billingService";
import { useAuthStore } from "@/store/authStore";

export default function MyInvoicesPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadInvoices = async () => {
      try {
        const response = await billingService.getInvoices();
        setInvoices(response.invoices);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load invoices.");
      }
    };

    void loadInvoices();
  }, [userId]);

  return (
    <MemberPortalShell activePage="invoices" title="MY INVOICES" subtitle="View your coach subscription billing history.">
      <section className="hh-card">
        {error ? <p className="hh-error-msg">{error}</p> : null}
        {invoices.length === 0 ? (
          <p className="hh-text-muted">No invoices found.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {invoices.map((invoice) => (
              <div key={invoice.payment_id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center", padding: 14, border: "1px solid var(--hh-border)", borderRadius: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{invoice.description ?? "Coach Subscription"}</p>
                  <p style={{ margin: "4px 0 0", color: "var(--hh-text-muted)", fontSize: 13 }}>{invoice.counterparty ?? "Coach"} · {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "Pending"}</p>
                </div>
                <span className="hh-badge">{invoice.status}</span>
                <strong>${invoice.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </MemberPortalShell>
  );
}
