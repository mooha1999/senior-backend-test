import { v4 as uuidv4 } from "uuid";
import type { IStockService } from "./interfaces/stock-service.interface";
import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import type { PaymentSuccessEvent } from "@infra/event-bus";
import { EVENT_NAMES } from "@infra/event-bus";

interface StockServiceConfig {
  successRate: number;
}

class StockService implements IStockService {
  private readonly processedEventIds = new Set<string>();

  constructor(
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
    private readonly config: StockServiceConfig,
  ) {}

  async handlePaymentSuccess(event: PaymentSuccessEvent): Promise<void> {
    if (this.processedEventIds.has(event.eventId)) {
      this.logger.warn({
        message: "Duplicate event skipped",
        eventId: event.eventId,
        event: EVENT_NAMES.PAYMENT_SUCCESS,
      });
      return;
    }
    this.processedEventIds.add(event.eventId);

    const success = Math.random() > 1 - this.config.successRate;

    this.logger.info({
      message: "Stock check",
      orderId: event.orderId,
      success,
    });

    if (success) {
      this.eventBus.emit(EVENT_NAMES.STOCK_UPDATED, {
        type: EVENT_NAMES.STOCK_UPDATED,
        eventId: uuidv4(),
        orderId: event.orderId,
        timestamp: Date.now(),
        requestId: event.requestId,
      });
    } else {
      this.eventBus.emit(EVENT_NAMES.STOCK_FAILED, {
        type: EVENT_NAMES.STOCK_FAILED,
        eventId: uuidv4(),
        orderId: event.orderId,
        timestamp: Date.now(),
        requestId: event.requestId,
        reason: "Insufficient stock",
      });
    }
  }
}

export { StockService };
export type { StockServiceConfig };
