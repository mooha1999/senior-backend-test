import { v4 as uuidv4 } from "uuid";
import type { IStockService } from "./interfaces/stock-service.interface";
import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";

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

  registerHandlers(): void {
    this.eventBus.on("payment.success", async (event) => {
      if (this.processedEventIds.has(event.eventId)) {
        this.logger.warn({
          message: "Duplicate event skipped",
          eventId: event.eventId,
          event: "payment.success",
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
        this.eventBus.emit("stock.updated", {
          type: "stock.updated",
          eventId: uuidv4(),
          orderId: event.orderId,
          timestamp: Date.now(),
          requestId: event.requestId,
        });
      } else {
        this.eventBus.emit("stock.failed", {
          type: "stock.failed",
          eventId: uuidv4(),
          orderId: event.orderId,
          timestamp: Date.now(),
          requestId: event.requestId,
          reason: "Insufficient stock",
        });
      }
    });
  }
}

export { StockService };
export type { StockServiceConfig };
