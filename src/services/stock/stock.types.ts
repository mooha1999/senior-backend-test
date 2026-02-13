interface StockCheckResult {
  success: boolean;
  orderId: string;
  reason?: string;
}

export type { StockCheckResult };
