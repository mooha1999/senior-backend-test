import { EventEmitter } from "events";
import type { ILogger } from "../interfaces/logger.interface";
import type { IEventBus } from "../interfaces/event-bus.interface";
import type { EventName, EventPayload } from "./types";

class EventBus implements IEventBus {
  private emitter: EventEmitter;

  constructor(private readonly logger: ILogger) {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  on<T extends EventName>(
    event: T,
    handler: (payload: EventPayload<T>) => Promise<void>,
  ): void {
    this.emitter.on(event, handler);
  }

  emit<T extends EventName>(event: T, payload: EventPayload<T>): void {
    this.logger.info({
      message: `${event} - OrderID: ${payload.orderId}`,
      event,
      orderId: payload.orderId,
      eventId: payload.eventId,
    });

    const listeners = this.emitter.listeners(event) as Array<
      (payload: EventPayload<T>) => Promise<void>
    >;

    for (const handler of listeners) {
      (async () => {
        try {
          await handler(payload);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          this.logger.error({
            message: `Event handler error for ${event}`,
            event,
            orderId: payload.orderId,
            eventId: payload.eventId,
            error: error.message,
            stack: error.stack,
          });
        }
      })();
    }
  }

  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}

export { EventBus };
