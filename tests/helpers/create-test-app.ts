import type { Express } from 'express';
import type { IEventBus } from '../../src/infra/interfaces/event-bus.interface';

interface TestApp {
  app: Express;
  eventBus: IEventBus;
  cleanup: () => void;
}

async function createTestApp(): Promise<TestApp> {
  process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

  const { createApp } = await import('../../src/app');
  const { app, eventBus } = createApp();

  return {
    app,
    eventBus,
    cleanup: () => {
      eventBus.removeAllListeners();
    },
  };
}

export { createTestApp };
export type { TestApp };
