import { v4 as uuidv4 } from "uuid";
import type { IPaymentService } from "./interfaces/payment-service.interface";
import type { IEventBus } from "@infra/interfaces/event-bus.interface";
import type { ILogger } from "@infra/interfaces/logger.interface";
import { EVENT_NAMES } from "@infra/event-bus";

interface PaymentServiceConfig {
  successRate: number;
  maxRetries: number;
  retryBaseDelayMs: number;
}

class PaymentService implements IPaymentService {
  private readonly processedEventIds = new Set<string>();

  constructor(
    private readonly eventBus: IEventBus,
    private readonly logger: ILogger,
    private readonly config: PaymentServiceConfig,
  ) {}

  registerHandlers(): void {
    this.eventBus.on(EVENT_NAMES.ORDER_CREATED, async (event) => {
      if (this.processedEventIds.has(event.eventId)) {
        this.logger.warn({
          message: "Duplicate event skipped",
          eventId: event.eventId,
          event: EVENT_NAMES.ORDER_CREATED,
        });
        return;
      }
      this.processedEventIds.add(event.eventId);

      let paid = false;

      for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
        const success = await this.processPayment(event.orderId, attempt);

        if (success) {
          paid = true;
          const amount = event.items.length * 100;
          this.eventBus.emit(EVENT_NAMES.PAYMENT_SUCCESS, {
            type: EVENT_NAMES.PAYMENT_SUCCESS,
            eventId: uuidv4(),
            orderId: event.orderId,
            timestamp: Date.now(),
            requestId: event.requestId,
            amount,
          });
          break;
        }

        if (attempt < this.config.maxRetries) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, this.config.retryBaseDelayMs * attempt),
          );
        }
      }

      if (!paid) {
        this.eventBus.emit(EVENT_NAMES.PAYMENT_FAILED, {
          type: EVENT_NAMES.PAYMENT_FAILED,
          eventId: uuidv4(),
          orderId: event.orderId,
          timestamp: Date.now(),
          requestId: event.requestId,
          reason: `Payment declined after ${this.config.maxRetries} attempts`,
        });
      }
    });
  }

  private async processPayment(
    orderId: string,
    attempt: number,
  ): Promise<boolean> {
    const success = Math.random() > 1 - this.config.successRate;
    this.logger.info({
      message: "Payment attempt",
      orderId,
      attempt,
      maxAttempts: this.config.maxRetries,
      success,
    });
    return success;
  }
}

export { PaymentService };
export type { PaymentServiceConfig };
