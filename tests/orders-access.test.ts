process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';
import { getAllTokens, type AuthTokens } from './helpers/auth.helpers';
import { createOrderAndWait } from './helpers/order.helpers';

describe('Orders access control', () => {
  let testApp: TestApp;
  let tokens: AuthTokens;

  beforeAll(async () => {
    testApp = await createTestApp();
    tokens = await getAllTokens(testApp.app);
  });

  afterAll(() => {
    testApp.cleanup();
  });

  describe('POST /orders — authorization', () => {
    it('customer can create an order (201)', async () => {
      const terminalPromise = (await import('./helpers/wait-for-event')).waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${tokens.customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(201);

      await terminalPromise;
    });

    it('admin cannot create an order (403)', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${tokens.adminToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(403);
    });

    it('brand cannot create an order (403)', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${tokens.brandToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(403);
    });

    it('unauthenticated request returns 401', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(401);
    });

    it('invalid JWT returns 401', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /orders — role-based filtering', () => {
    let brand1OrderId: string;
    let brand2OrderId: string;

    beforeAll(async () => {
      // Customer1 creates 2 orders: one with brand1 products, one with brand2 products
      const order1 = await createOrderAndWait(
        testApp.app,
        testApp.eventBus,
        tokens.customerToken,
        [{ productId: 'brand1-product-abc', quantity: 1 }],
      );
      brand1OrderId = order1.orderId;

      const order2 = await createOrderAndWait(
        testApp.app,
        testApp.eventBus,
        tokens.customerToken,
        [{ productId: 'brand2-product-def', quantity: 1 }],
      );
      brand2OrderId = order2.orderId;
    });

    it('admin sees all orders', async () => {
      const res = await request(testApp.app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // Admin should see at least the 2 orders created above (plus any from authorization tests)
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('customer1 sees only their own orders', async () => {
      const res = await request(testApp.app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokens.customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      for (const order of res.body) {
        expect(order.customerId).toBe('user-customer-1');
      }
    });

    it('customer2 sees empty array (0 orders — they created none)', async () => {
      const res = await request(testApp.app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokens.customer2Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('brand1 sees only orders containing brand1 products', async () => {
      const res = await request(testApp.app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokens.brandToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      for (const order of res.body) {
        const hasBrand1Product = order.items.some(
          (item: { productId: string }) => item.productId.startsWith('brand1'),
        );
        expect(hasBrand1Product).toBe(true);
      }
    });

    it('brand2 sees only orders containing brand2 products', async () => {
      const res = await request(testApp.app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokens.brand2Token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      for (const order of res.body) {
        const hasBrand2Product = order.items.some(
          (item: { productId: string }) => item.productId.startsWith('brand2'),
        );
        expect(hasBrand2Product).toBe(true);
      }
    });

    it('unauthenticated request returns 401', async () => {
      const res = await request(testApp.app)
        .get('/orders');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /orders/:id — role-based access', () => {
    let brand1OrderId: string;
    let brand2OrderId: string;

    beforeAll(async () => {
      const order1 = await createOrderAndWait(
        testApp.app,
        testApp.eventBus,
        tokens.customerToken,
        [{ productId: 'brand1-product-abc', quantity: 1 }],
      );
      brand1OrderId = order1.orderId;

      const order2 = await createOrderAndWait(
        testApp.app,
        testApp.eventBus,
        tokens.customerToken,
        [{ productId: 'brand2-product-def', quantity: 1 }],
      );
      brand2OrderId = order2.orderId;
    });

    it('customer1 can access their own order (200)', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand1OrderId}`)
        .set('Authorization', `Bearer ${tokens.customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(brand1OrderId);
    });

    it('customer2 cannot access customer1\'s order (404)', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand1OrderId}`)
        .set('Authorization', `Bearer ${tokens.customer2Token}`);

      expect(res.status).toBe(404);
    });

    it('admin can access any order (200)', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand1OrderId}`)
        .set('Authorization', `Bearer ${tokens.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(brand1OrderId);
    });

    it('brand1 can access order with brand1 products (200)', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand1OrderId}`)
        .set('Authorization', `Bearer ${tokens.brandToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(brand1OrderId);
    });

    it('brand1 cannot access order with only brand2 products (404)', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand2OrderId}`)
        .set('Authorization', `Bearer ${tokens.brandToken}`);

      expect(res.status).toBe(404);
    });

    it('nonexistent orderId returns 404', async () => {
      const res = await request(testApp.app)
        .get('/orders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${tokens.customerToken}`);

      expect(res.status).toBe(404);
    });

    it('unauthenticated request returns 401', async () => {
      const res = await request(testApp.app)
        .get(`/orders/${brand1OrderId}`);

      expect(res.status).toBe(401);
    });
  });
});
