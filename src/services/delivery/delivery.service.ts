import { v4 as uuidv4 } from "uuid";
import type { IDeliveryService } from "./interfaces/delivery-service.interface";
import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import type { StockUpdatedEvent } from "@infra/event-bus";
import { EVENT_NAMES } from "@infra/event-bus";

class DeliveryService implements IDeliveryService {
  private readonly processedEventIds = new Set<string>();

  constructor(
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
  ) {}

  async handleStockUpdated(event: StockUpdatedEvent): Promise<void> {
    if (this.processedEventIds.has(event.eventId)) {
      this.logger.warn({
        message: "Duplicate event skipped",
        eventId: event.eventId,
        event: EVENT_NAMES.STOCK_UPDATED,
      });
      return;
    }
    this.processedEventIds.add(event.eventId);

    const estimatedDelivery = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    ).toISOString();

    this.logger.info({
      message: "Delivery scheduled",
      orderId: event.orderId,
      estimatedDelivery,
    });

    this.eventBus.emit(EVENT_NAMES.DELIVERY_SCHEDULED, {
      type: EVENT_NAMES.DELIVERY_SCHEDULED,
      eventId: uuidv4(),
      orderId: event.orderId,
      timestamp: Date.now(),
      requestId: event.requestId,
      estimatedDelivery,
    }, "DeliveryService");
  }
}

export { DeliveryService };
