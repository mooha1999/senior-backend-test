process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';
import { loginAs } from './helpers/auth.helpers';
import { waitForNextTerminalEvent } from './helpers/wait-for-event';

describe('POST /orders', () => {
  let testApp: TestApp;
  let customerToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    customerToken = await loginAs(testApp.app, 'customer@marketplace.com', 'customer123');
  });

  afterAll(() => {
    testApp.cleanup();
  });

  describe('validation', () => {
    it('returns 400 for empty items array', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
    });

    it('returns 400 for missing items field', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('returns 400 for item with quantity 0', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 0 }] });

      expect(res.status).toBe(400);
    });

    it('returns 400 for item with negative quantity', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: -1 }] });

      expect(res.status).toBe(400);
    });

    it('returns 400 for item with missing productId', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ quantity: 2 }] });

      expect(res.status).toBe(400);
    });

    it('returns 400 for item with empty productId string', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: '', quantity: 2 }] });

      expect(res.status).toBe(400);
    });

    it('returns 400 for empty request body', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send();

      expect(res.status).toBe(400);
    });

    it('error response has { error, code, details }', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.details)).toBe(true);
    });

    it('details array contains field and message for each validation error', async () => {
      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.details.length).toBeGreaterThan(0);
      for (const detail of res.body.details) {
        expect(typeof detail.field).toBe('string');
        expect(typeof detail.message).toBe('string');
      }
    });
  });

  describe('response shape', () => {
    it('returns 201 with correct shape: { id, customerId, items, status, createdAt, updatedAt }', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('customerId');
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');

      await terminalPromise;
    });

    it('id is a valid UUID', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(201);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(res.body.id).toMatch(uuidRegex);

      await terminalPromise;
    });

    it('status is "PENDING"', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('PENDING');

      await terminalPromise;
    });

    it('customerId matches the JWT user id, not the request body', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerId: 'fake-customer-id',
          items: [{ productId: 'brand1-product-abc', quantity: 1 }],
        });

      expect(res.status).toBe(201);
      expect(res.body.customerId).toBe('user-customer-1');
      expect(res.body.customerId).not.toBe('fake-customer-id');

      await terminalPromise;
    });

    it('items match what was sent', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const items = [
        { productId: 'brand1-product-abc', quantity: 2 },
        { productId: 'brand2-product-def', quantity: 3 },
      ];

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items });

      expect(res.status).toBe(201);
      expect(res.body.items).toEqual(items);

      await terminalPromise;
    });

    it('createdAt and updatedAt are valid ISO date strings', async () => {
      const terminalPromise = waitForNextTerminalEvent(testApp.eventBus);

      const res = await request(testApp.app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ items: [{ productId: 'brand1-product-abc', quantity: 1 }] });

      expect(res.status).toBe(201);
      expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
      expect(new Date(res.body.updatedAt).toISOString()).toBe(res.body.updatedAt);

      await terminalPromise;
    });
  });
});
