import type { StockUpdatedEvent } from "@infra/event-bus";

interface IDeliveryService {
  handleStockUpdated(event: StockUpdatedEvent): Promise<void>;
}

export type { IDeliveryService };
