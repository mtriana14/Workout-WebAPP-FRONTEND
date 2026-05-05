"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle } from "lucide-react";
import { MemberPortalShell } from "@/app/components/memberPortalShell";
import { billingService, type BillingCoach, type Invoice, type SavedCard } from "@/services/billingService";
import { useAuthStore } from "@/store/authStore";

type PaymentMethod = "saved" | "new";

export default function BillingPage() {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [coaches, setCoaches] = useState<BillingCoach[]>([]);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [amount, setAmount] = useState("150");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("new");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const { user } = useAuthStore();
  const userId = user?.id ?? user?.user_id;

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        const [coachResponse, invoiceResponse, cardResponse] = await Promise.all([
          billingService.getMyCoaches(true),
          userId ? billingService.getInvoices() : Promise.resolve({ invoices: [] as Invoice[] }),
          billingService.getSavedCards(),
        ]);
        setCoaches(coachResponse.coaches);
        setInvoices(invoiceResponse.invoices);
        setSavedCards(cardResponse.cards);
        if (coachResponse.coaches[0]) {
          setSelectedCoachId(String(coachResponse.coaches[0].coach_id));
          setAmount(String(coachResponse.coaches[0].hourly_rate ?? 150));
        }
        if (cardResponse.cards.length > 0) {
          setPaymentMethod("saved");
          setSelectedCardId(cardResponse.cards[0].card_id);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load billing data.");
      }
    };

    void loadBillingData();
  }, [userId]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      const month = parseInt(val.slice(0, 2), 10);
      if (month > 12) val = "12" + val.slice(2);
      else if (month === 0 && val.length >= 2) val = "01" + val.slice(2);
      val = val.slice(0, 2) + (val.length > 2 ? "/" + val.slice(2) : "");
    }
    setExpiry(val);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    setCvc(val);
  };

  async function handleSubscribe(e: React.SyntheticEvent<HTMLFormElement>) {
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

    if (paymentMethod === "new") {
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
    } else {
      if (!selectedCardId) {
        setError("Select a saved card.");
        return;
      }
    }

    setIsSubscribing(true);
    try {
      if (paymentMethod === "saved" && selectedCardId) {
        await billingService.subscribeWithSavedCard(Number(selectedCoachId), selectedCardId);
      } else {
        await billingService.subscribeWithNewCard({
          coach_id: Number(selectedCoachId),
          card_number: cardNumber,
          expiry,
          save_card: saveCard,
        });
      }
      const invoiceResponse = await billingService.getInvoices();
      setInvoices(invoiceResponse.invoices);
      if (paymentMethod === "new" && saveCard) {
        const cardResponse = await billingService.getSavedCards();
        setSavedCards(cardResponse.cards);
      }
      setIsSubscribing(false);
      setSuccess(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to create subscription.");
      setIsSubscribing(false);
    }
  }

  const formatCard = (card: SavedCard) => {
    const brand = card.card_brand ? card.card_brand.charAt(0).toUpperCase() + card.card_brand.slice(1) : "Card";
    return `${brand} •••• ${card.last_four}  (${String(card.expiry_month).padStart(2, "0")}/${card.expiry_year})`;
  };

  return (
    <MemberPortalShell activePage="billing" title="BILLING" subtitle="Manage your subscription and view past invoices.">
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

              {/* Coach selector */}
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
                  {coaches.length === 0 ? <option value="">No active coach — find one first</option> : null}
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

              {/* Payment method toggle — only shown when saved cards exist */}
              {savedCards.length > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("saved")}
                    className={paymentMethod === "saved" ? "btn btn--primary" : "btn btn--secondary"}
                    style={{ flex: 1, fontSize: 13 }}
                  >
                    Saved card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("new")}
                    className={paymentMethod === "new" ? "btn btn--primary" : "btn btn--secondary"}
                    style={{ flex: 1, fontSize: 13 }}
                  >
                    New card
                  </button>
                </div>
              )}

              {/* Saved card selector */}
              {paymentMethod === "saved" && savedCards.length > 0 && (
                <div className="hh-field">
                  <label className="hh-field__label">Card</label>
                  <select
                    className="hh-input"
                    value={selectedCardId ?? ""}
                    onChange={(e) => setSelectedCardId(Number(e.target.value))}
                    style={{ appearance: "auto" }}
                    required
                  >
                    {savedCards.map((card) => (
                      <option key={card.card_id} value={card.card_id}>
                        {formatCard(card)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* New card fields */}
              {paymentMethod === "new" && (
                <>
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

                  {/* Save card checkbox */}
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--hh-text-muted)" }}>
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "var(--hh-accent)", cursor: "pointer" }}
                    />
                    Save this card for future payments
                  </label>
                </>
              )}

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
