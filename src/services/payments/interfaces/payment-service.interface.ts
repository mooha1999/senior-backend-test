import type { OrderCreatedEvent } from "@infra/event-bus";

interface IPaymentService {
  handleOrderCreated(event: OrderCreatedEvent): Promise<void>;
}

export type { IPaymentService };
