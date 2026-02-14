process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';

describe('GET /health', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(() => {
    testApp.cleanup();
  });

  it('returns 200 with status ok and a timestamp string', async () => {
    const res = await request(testApp.app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
