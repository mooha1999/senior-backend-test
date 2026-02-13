import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'marketplace-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '60', 10),
  paymentSuccessRate: parseFloat(process.env.PAYMENT_SUCCESS_RATE || '0.7'),
  stockSuccessRate: parseFloat(process.env.STOCK_SUCCESS_RATE || '0.8'),
  paymentMaxRetries: parseInt(process.env.PAYMENT_MAX_RETRIES || '3', 10),
  paymentRetryBaseDelayMs: parseInt(process.env.PAYMENT_RETRY_BASE_DELAY_MS || '1000', 10),
} as const;

export { config };
