"use client";

import { useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";

export default function BillingPage() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  // New state variables for payment fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

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

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();

    // Basic pre-submit validation check
    if (cardNumber.replace(/\s/g, "").length < 15) {
      alert("Please enter a valid card number.");
      return;
    }
    if (expiry.length < 5) {
      alert("Please enter a complete expiry date (MM/YY).");
      return;
    }
    if (cvc.length < 3) {
      alert("Please enter a valid CVC code.");
      return;
    }

    setIsSubscribing(true);
    // Fake Stripe API delay for the demo
    setTimeout(() => {
      setIsSubscribing(false);
      setSuccess(true);
    }, 1500); 
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
                {isSubscribing ? "Processing..." : "Pay $150.00 / month"}
              </button>
            </form>
          )}
        </section>

        <section className="hh-card" style={{ flex: 1 }}>
          <h2 className="hh-panel-heading" style={{ marginBottom: 16 }}>Billing History</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #2c2c30", paddingBottom: 12 }}>
              <div>
                <p style={{ color: "white", fontSize: 14 }}>Coach Subscription</p>
                <p className="hh-text-muted" style={{ fontSize: 12 }}>Mar 1, 2026</p>
              </div>
              <p style={{ color: "white", fontWeight: 600 }}>$150.00</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ color: "white", fontSize: 14 }}>Coach Subscription</p>
                <p className="hh-text-muted" style={{ fontSize: 12 }}>Feb 1, 2026</p>
              </div>
              <p style={{ color: "white", fontWeight: 600 }}>$150.00</p>
            </div>
          </div>
        </section>
      </div>
    </MemberPortalShell>
  );
}