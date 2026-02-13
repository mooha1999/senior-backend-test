import { EventEmitter } from 'events';
import { logger } from '../logger';
import type { EventName, EventPayload } from './types';

class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
  }

  on<T extends EventName>(event: T, handler: (payload: EventPayload<T>) => Promise<void>): void {
    this.emitter.on(event, handler);
  }

  emit<T extends EventName>(event: T, payload: EventPayload<T>): void {
    logger.info({
      message: `[EVENT] ${event} - OrderID: ${payload.orderId}`,
      event,
      orderId: payload.orderId,
      eventId: payload.eventId,
    });

    const listeners = this.emitter.listeners(event) as Array<(payload: EventPayload<T>) => Promise<void>>;

    for (const handler of listeners) {
      (async () => {
        try {
          await handler(payload);
        } catch (err: unknown) {
          const error = err instanceof Error ? err : new Error(String(err));
          logger.error({
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

const eventBus = new EventBus();

export { EventBus, eventBus };
