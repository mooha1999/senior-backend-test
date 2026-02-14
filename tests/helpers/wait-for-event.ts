import type { IEventBus } from '../../src/infra/interfaces/event-bus.interface';
import type { EventName } from '../../src/infra/event-bus/types';
import { EVENT_NAMES } from '../../src/infra/event-bus/types';

const TERMINAL_EVENTS: EventName[] = [
  EVENT_NAMES.DELIVERY_SCHEDULED,
  EVENT_NAMES.PAYMENT_FAILED,
  EVENT_NAMES.STOCK_FAILED,
];

function waitForTerminalEvent(
  eventBus: IEventBus,
  orderId: string,
  timeoutMs: number = 10000,
): Promise<EventName> {
  return new Promise<EventName>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for terminal event for order ${orderId}`));
    }, timeoutMs);

    for (const eventName of TERMINAL_EVENTS) {
      eventBus.on(eventName, async (payload) => {
        if (payload.orderId === orderId) {
          clearTimeout(timer);
          resolve(eventName);
        }
      });
    }
  });
}

function waitForNextTerminalEvent(
  eventBus: IEventBus,
  timeoutMs: number = 10000,
): Promise<{ eventName: EventName; orderId: string }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timed out waiting for terminal event'));
    }, timeoutMs);

    for (const eventName of TERMINAL_EVENTS) {
      eventBus.on(eventName, async (payload) => {
        clearTimeout(timer);
        resolve({ eventName, orderId: payload.orderId });
      });
    }
  });
}

export { waitForTerminalEvent, waitForNextTerminalEvent, TERMINAL_EVENTS };
