import { apiClient } from "@/lib/api";

export interface Invoice {
  payment_id: number;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed" | "refunded";
  description: string | null;
  method: string | null;
  counterparty: string | null;
  subscription_id: number | null;
  paid_at: string | null;
  created_at: string | null;
}

export interface Subscription {
  subscription_id: number;
  amount: number;
  plan_type: string;
  start_date: string;
  next_billing: string;
}

export interface BillingCoach {
  coach_id: number;
  user_id?: number;
  name: string;
  specialization: string;
  hourly_rate: number | null;
}

export interface SavedCard {
  card_id: number;
  last_four: string;
  card_brand: string | null;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
}

export const billingService = {
  subscribeWithNewCard: (payload: {
    coach_id: number;
    card_number: string;
    expiry: string;
    save_card: boolean;
  }) => {
    const [expiryMonth, expiryYear] = payload.expiry.split("/");
    return apiClient<{ message: string } & Subscription>(`client/subscribe/${payload.coach_id}`, {
      method: "POST",
      body: {
        last_four: payload.card_number.replace(/\D/g, "").slice(-4),
        card_brand: "card",
        expiry_month: Number(expiryMonth),
        expiry_year: 2000 + Number(expiryYear),
        save_card: payload.save_card,
        plan_type: "Monthly",
      },
    });
  },

  subscribeWithSavedCard: (coach_id: number, card_id: number) =>
    apiClient<{ message: string } & Subscription>(`client/subscribe/${coach_id}`, {
      method: "POST",
      body: { card_id, plan_type: "Monthly" },
    }),

  getSavedCards: () =>
    apiClient<{ cards: SavedCard[] }>("client/saved-cards", { method: "GET" }),

  getInvoices: () =>
    apiClient<{ total_paid: number; count: number; invoices: Invoice[] }>("billing/invoices", {
      method: "GET",
    }),

  getCoaches: () =>
    apiClient<{ coaches: BillingCoach[] }>("client/coaches", {
      method: "GET",
    }),

  getMyCoaches: (activeOnly = false) =>
    apiClient<{ coaches: BillingCoach[] }>(
      `client/my-coaches${activeOnly ? "?active_only=true" : ""}`,
      { method: "GET" },
    ),
};
