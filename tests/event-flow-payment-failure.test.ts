process.env.PAYMENT_SUCCESS_RATE = '0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';
import { loginAs } from './helpers/auth.helpers';
import { waitForNextTerminalEvent } from './helpers/wait-for-event';
import { EVENT_NAMES } from '../src/infra/event-bus/types';

describe('Order event flow — payment failure', () => {
  let testApp: TestApp;
  let customerToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    customerToken = await loginAs(testApp.app, 'customer@marketplace.com', 'customer123');
  });

  afterAll(() => {
    testApp.cleanup();
  });

  it('order transitions to PAYMENT_FAILED when all payment attempts fail', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    expect(res.status).toBe(201);

    await terminalPromise;

    const orderRes = await request(testApp.app)
      .get(`/orders/${res.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(orderRes.body.status).toBe('PAYMENT_FAILED');
  });

  it('terminal event is payment.failed', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    const { eventName } = await terminalPromise;

    expect(eventName).toBe(EVENT_NAMES.PAYMENT_FAILED);
  });

  it('GET /orders/:id returns status PAYMENT_FAILED', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    await terminalPromise;

    const orderRes = await request(testApp.app)
      .get(`/orders/${res.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.status).toBe('PAYMENT_FAILED');
  });
});
