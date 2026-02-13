interface PaymentResult {
  success: boolean;
  orderId: string;
  amount?: number;
  reason?: string;
}

export type { PaymentResult };
