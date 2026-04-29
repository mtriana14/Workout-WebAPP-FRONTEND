import { apiClient } from "@/lib/api";

export interface PaymentRecord {
  payment_id: number;
  user_id: number;
  client_name: string;
  user_email: string;
  coach_id: number;
  coach_name: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  payment_method: string;
  stripe_payment_id?: string;
  created_at: string;
}

export interface PaymentSummary {
  total_revenue: number;
  total_transactions: number;
  pending_payments: number;
  completed_payments: number;
  failed_payments: number;
  this_month_revenue: number;
  last_month_revenue: number;
  
}

interface PaymentsResponse {
  payments: PaymentRecord[];
  summary: PaymentSummary;
}

interface PaymentStatsResponse {
  summary: PaymentSummary;
  total_revenue?: number;
  monthly_data: {
    month: string;
    revenue: number;
    transactions: number;
    
  }[];
}

export const paymentService = {
  // Get all payments with summary (admin dashboard)
  getAll: (params?: { status?: string; from?: string; to?: string }) => {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
      console.log(queryString);
    return apiClient<PaymentsResponse>(`admin/payments${queryString}`, {
      method: "GET",
    });
  },

  // Get payment statistics/summary
  getStats: () =>
    apiClient<PaymentStatsResponse>("admin/payments/stats", {
      method: "GET",
    }),

  // Get single payment details
  getById: (paymentId: number) =>
    apiClient<{ payment: PaymentRecord }>(`admin/payments/${paymentId}`, {
      method: "GET",
    }),

  // Process refund (if needed)
  refund: (paymentId: number) =>
    apiClient<{ message: string }>(`admin/payments/${paymentId}/refund`, {
      method: "POST",
    }),

  getCoachRevenue: () =>
    apiClient<{
      summary: { total_earned: number; this_month: number; active_clients: number; currency: string };
      transactions: Array<{
        payment_id: number;
        amount: number;
        status: string;
        counterparty: string | null;
        paid_at: string | null;
        created_at: string | null;
      }>;
      count: number;
    }>("coach/revenue", { method: "GET" }),
};
