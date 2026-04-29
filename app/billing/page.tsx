"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { billingService, type BillingCoach, type Invoice } from "@/services/billingService";
import { useAuthStore } from "@/store/authStore";

export default function BillingPage() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [coaches, setCoaches] = useState<BillingCoach[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [amount, setAmount] = useState("150");
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  // New state variables for payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const [coachResponse, invoiceResponse] = await Promise.all([
          billingService.getCoaches(),
          userId ? billingService.getInvoices() : Promise.resolve({ invoices: [] }),
        ]);
        setCoaches(coachResponse.coaches);
        setInvoices(invoiceResponse.invoices);
        if (coachResponse.coaches[0]) {
          setSelectedCoachId(String(coachResponse.coaches[0].coach_id));
          setAmount(String(coachResponse.coaches[0].hourly_rate ?? 150));
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load billing data.");
      }
    };

    void loadBillingData();
  }, [userId]);

  // Input Formatting Handlers
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.length > 16) val = val.slice(0, 16); // Limit to 16 numbers
    val = val.replace(/(\d{4})(?=\d)/g, "$1 "); // Add space after every 4 numbers
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.length > 4) val = val.slice(0, 4); // Limit to 4 numbers total (MMYY)
    
    // Automatically format MM/YY and prevent invalid months
    if (val.length >= 2) {
      const month = parseInt(val.slice(0, 2), 10);
      if (month > 12) {
        val = "12" + val.slice(2);
      } else if (month === 0 && val.length >= 2) {
        val = "01" + val.slice(2);
      }
      val = val.slice(0, 2) + (val.length > 2 ? "/" + val.slice(2) : "");
    }
    setExpiry(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.length > 4) val = val.slice(0, 4); // Limit to max 4 digits (AMEX uses 4, Visa/MC uses 3)
    setCvc(val);
  };

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Sign in before subscribing.");
      return;
    }

    if (!selectedCoachId) {
      setError("Select a coach before subscribing.");
      return;
    }

    // Basic pre-submit validation check
    if (cardNumber.replace(/\s/g, "").length < 15) {
      setError("Please enter a valid card number.");
      return;
    }
    if (expiry.length < 5) {
      setError("Please enter a complete expiry date (MM/YY).");
      return;
    }
    if (cvc.length < 3) {
      setError("Please enter a valid CVC code.");
      return;
    }

    setIsSubscribing(true);
    try {
      await billingService.subscribe({
        coach_id: Number(selectedCoachId),
        card_number: cardNumber,
        expiry,
        cvc,
      });
      const invoiceResponse = await billingService.getInvoices();
      setInvoices(invoiceResponse.invoices);
      setIsSubscribing(false);
      setSuccess(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create subscription.");
      setIsSubscribing(false);
    }
  }

  return (
    <MemberPortalShell activePage="billing" title="BILLING & SUBSCRIPTIONS" subtitle="Manage your payment methods and view past invoices.">
      <div className="hh-bottom-row">
        <section className="hh-card" style={{ flex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <CreditCard color="var(--hh-accent)" />
            <h2 className="hh-panel-heading" style={{ margin: 0 }}>Subscribe to Coach</h2>
          </div>
          
          {success ? (
            <div style={{ padding: 24, textAlign: "center", backgroundColor: "rgba(35, 134, 54, 0.1)", borderRadius: 8, border: "1px solid var(--hh-green)" }}>
              <CheckCircle size={32} color="var(--hh-green)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ color: "white", marginBottom: 8 }}>Payment Successful</h3>
              <p className="hh-text-muted">Your subscription is now active.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p className="hh-portal-card-copy">Secure payment processing powered by Stripe.</p>
              {error ? <p className="hh-error-msg">{error}</p> : null}
              <div className="hh-field">
                <label className="hh-field__label">Coach</label>
                <select
                  className="hh-input"
                  value={selectedCoachId}
                  onChange={(event) => {
                    const coach = coaches.find((item) => item.coach_id === Number(event.target.value));
                    setSelectedCoachId(event.target.value);
                    setAmount(String(coach?.hourly_rate ?? 150));
                  }}
                  style={{ appearance: "auto" }}
                  required
                >
                  {coaches.length === 0 ? <option value="">No coaches available</option> : null}
                  {coaches.map((coach) => (
                    <option key={coach.coach_id} value={coach.coach_id}>
                      {coach.name} · {coach.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hh-field">
                <label className="hh-field__label">Monthly Amount</label>
                <input
                  className="hh-input"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                />
              </div>
              
              <div className="hh-field">
                <label className="hh-field__label">Card Number</label>
                <input 
                  className="hh-input" 
                  placeholder="•••• •••• •••• 4242" 
                  value={cardNumber}
                  onChange={handleCardChange}
                  required 
                />
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div className="hh-field" style={{ flex: 1 }}>
                  <label className="hh-field__label">Expiry (MM/YY)</label>
                  <input 
                    className="hh-input" 
                    placeholder="12/26" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    required 
                  />
                </div>
                <div className="hh-field" style={{ flex: 1 }}>
                  <label className="hh-field__label">CVC</label>
                  <input 
                    className="hh-input" 
                    placeholder="123" 
                    value={cvc}
                    onChange={handleCvcChange}
                    required 
                    type="password" 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn--primary" disabled={isSubscribing}>
                {isSubscribing ? "Processing..." : `Pay $${Number(amount || 0).toFixed(2)} / month`}
              </button>
            </form>
          )}
        </section>

        <section className="hh-card" style={{ flex: 1 }}>
          <h2 className="hh-panel-heading" style={{ marginBottom: 16 }}>Billing History</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {invoices.length === 0 ? (
              <p className="hh-text-muted" style={{ fontSize: 13 }}>No invoices yet.</p>
            ) : invoices.slice(0, 6).map((invoice, index) => (
              <div key={invoice.payment_id} style={{ display: "flex", justifyContent: "space-between", borderBottom: index < invoices.length - 1 ? "1px solid #2c2c30" : "none", paddingBottom: 12 }}>
                <div>
                  <p style={{ color: "white", fontSize: 14 }}>{invoice.description ?? "Coach Subscription"}</p>
                  <p className="hh-text-muted" style={{ fontSize: 12 }}>
                    {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "Pending"} · {invoice.counterparty ?? "Coach"}
                  </p>
                </div>
                <p style={{ color: "white", fontWeight: 600 }}>${invoice.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MemberPortalShell>
  );
}
