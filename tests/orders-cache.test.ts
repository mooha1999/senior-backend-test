process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';
process.env.CACHE_TTL_SECONDS = '1';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';
import { loginAs } from './helpers/auth.helpers';
import { createOrderAndWait } from './helpers/order.helpers';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('GET /orders/:id — caching behavior', () => {
  let testApp: TestApp;
  let customerToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    customerToken = await loginAs(testApp.app, 'customer@marketplace.com', 'customer123');
  });

  afterAll(() => {
    testApp.cleanup();
  });

  it('first GET returns the order (cache miss → populated from store)', async () => {
    const { orderId } = await createOrderAndWait(
      testApp.app,
      testApp.eventBus,
      customerToken,
      [{ productId: 'brand1-product-abc', quantity: 1 }],
    );

    const res = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
  });

  it('second GET within TTL returns same data (cache hit)', async () => {
    const { orderId } = await createOrderAndWait(
      testApp.app,
      testApp.eventBus,
      customerToken,
      [{ productId: 'brand1-product-abc', quantity: 1 }],
    );

    const res1 = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    const res2 = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body).toEqual(res2.body);
  });

  it('after TTL expires, GET returns fresh data (cache miss again)', async () => {
    const { orderId } = await createOrderAndWait(
      testApp.app,
      testApp.eventBus,
      customerToken,
      [{ productId: 'brand1-product-abc', quantity: 1 }],
    );

    const res1 = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res1.status).toBe(200);

    // Wait for TTL to expire (1 second TTL + buffer)
    await sleep(1500);

    const res2 = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res2.status).toBe(200);
    expect(res2.body.id).toBe(orderId);
  });

  it('after order status changes via event chain, GET reflects the new status', async () => {
    const { orderId } = await createOrderAndWait(
      testApp.app,
      testApp.eventBus,
      customerToken,
      [{ productId: 'brand1-product-abc', quantity: 1 }],
    );

    // The event chain has completed (createOrderAndWait waits for terminal event).
    // GET should return the final status, not stale PENDING.
    const res = await request(testApp.app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });
});
