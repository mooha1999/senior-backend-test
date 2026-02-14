process.env.PAYMENT_SUCCESS_RATE = '1.0';
process.env.STOCK_SUCCESS_RATE = '1.0';
process.env.PAYMENT_RETRY_BASE_DELAY_MS = '0';

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createTestApp, type TestApp } from './helpers/create-test-app';

describe('POST /auth/login', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterAll(() => {
    testApp.cleanup();
  });

  it('returns 200 with token and user object for valid customer credentials', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'customer@marketplace.com', password: 'customer123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('customer');
  });

  it('returns 200 with token and user object for valid admin credentials', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'admin@marketplace.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
  });

  it('returns 200 with token and user object for valid brand credentials', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'brand@marketplace.com', password: 'brand123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('brand');
  });

  it('user object contains id, email, role (and NOT password)', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'customer@marketplace.com', password: 'customer123' });

    expect(res.status).toBe(200);
    expect(typeof res.body.user.id).toBe('string');
    expect(res.body.user.id.length).toBeGreaterThan(0);
    expect(typeof res.body.user.email).toBe('string');
    expect(res.body.user.email).toBe('customer@marketplace.com');
    expect(typeof res.body.user.role).toBe('string');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });

  it('token is a valid JWT string (3 dot-separated segments)', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'customer@marketplace.com', password: 'customer123' });

    expect(res.status).toBe(200);
    const parts = res.body.token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'customer@marketplace.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for nonexistent email', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'nobody@marketplace.com', password: 'password' });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing password field', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'customer@marketplace.com' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for missing email field', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ password: 'customer123' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for empty body', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid email format', async () => {
    const res = await request(testApp.app)
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'customer123' });

    expect(res.status).toBe(400);
  });
});
