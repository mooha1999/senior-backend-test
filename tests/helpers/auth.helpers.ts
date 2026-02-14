import request from 'supertest';
import type { Express } from 'express';

interface AuthTokens {
  customerToken: string;
  customer2Token: string;
  adminToken: string;
  brandToken: string;
  brand2Token: string;
}

async function loginAs(
  app: Express,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password });

  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res.body.token as string;
}

async function getAllTokens(app: Express): Promise<AuthTokens> {
  const [customerToken, customer2Token, adminToken, brandToken, brand2Token] =
    await Promise.all([
      loginAs(app, 'customer@marketplace.com', 'customer123'),
      loginAs(app, 'customer2@marketplace.com', 'customer456'),
      loginAs(app, 'admin@marketplace.com', 'admin123'),
      loginAs(app, 'brand@marketplace.com', 'brand123'),
      loginAs(app, 'brand2@marketplace.com', 'brand456'),
    ]);

  return { customerToken, customer2Token, adminToken, brandToken, brand2Token };
}

export { loginAs, getAllTokens };
export type { AuthTokens };
