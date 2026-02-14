import request from 'supertest';
import type { Express } from 'express';
import type { IEventBus } from '../../src/infra/interfaces/event-bus.interface';
import type { EventName } from '../../src/infra/event-bus/types';
import { waitForNextTerminalEvent } from './wait-for-event';

interface CreateOrderResult {
  orderId: string;
  response: request.Response;
  terminalEvent: EventName;
}

async function createOrderAndWait(
  app: Express,
  eventBus: IEventBus,
  token: string,
  items: Array<{ productId: string; quantity: number }>,
): Promise<CreateOrderResult> {
  const terminalPromise = waitForNextTerminalEvent(eventBus);

  const response = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ items });

  if (response.status !== 201) {
    throw new Error(`Order creation failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const { eventName } = await terminalPromise;

  return {
    orderId: response.body.id,
    response,
    terminalEvent: eventName,
  };
}

export { createOrderAndWait };
export type { CreateOrderResult };
