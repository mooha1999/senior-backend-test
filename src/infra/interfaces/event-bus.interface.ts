import type { EventName, EventPayload } from "../event-bus/types";

interface IEventBus {
  on<T extends EventName>(
    event: T,
    handler: (payload: EventPayload<T>) => Promise<void>,
  ): void;
  emit<T extends EventName>(event: T, payload: EventPayload<T>, service: string): void;
  removeAllListeners(): void;
}

export type { IEventBus };
