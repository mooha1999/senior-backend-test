process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';
import { loginAs } from './helpers/auth.helpers';
import { waitForNextTerminalEvent } from './helpers/wait-for-event';
import { EVENT_NAMES } from '../src/infra/event-bus/types';

describe('Order event flow — happy path', () => {
  let testApp: TestApp;
  let customerToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    customerToken = await loginAs(testApp.app, 'customer@marketplace.com', 'customer123');
  });

  afterAll(() => {
    testApp.cleanup();
  });

  it('order transitions from PENDING to COMPLETED when payment and stock succeed', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('PENDING');

    const { eventName } = await terminalPromise;

    const orderRes = await request(testApp.app)
      .get(`/orders/${res.body.id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.status).toBe('COMPLETED');
  });

  it('terminal event is delivery.scheduled', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    const { eventName } = await terminalPromise;

    expect(eventName).toBe(EVENT_NAMES.DELIVERY_SCHEDULED);
  });

  it('created order has correct customerId (from JWT, not request body)', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    expect(res.body.customerId).toBe('user-customer-1');

    await terminalPromise;
  });

  it('created order has correct items', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const items = [{ productId: 'brand1-product-abc', quantity: 3 }];
    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items });

    expect(res.body.items).toEqual(items);

    await terminalPromise;
  });

  it('created order initial response has status PENDING', async () => {
    const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

    const res = await request(testApp.app)
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

    expect(res.body.status).toBe('PENDING');

    await terminalPromise;
  });

  it('final GET /orders/:id returns status COMPLETED', async () => {
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
    expect(orderRes.body.status).toBe('COMPLETED');
  });
});
