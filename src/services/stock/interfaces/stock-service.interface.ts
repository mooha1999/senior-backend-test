import type { PaymentSuccessEvent } from "@infra/event-bus";

interface IStockService {
  handlePaymentSuccess(event: PaymentSuccessEvent): Promise<void>;
}

export type { IStockService };
