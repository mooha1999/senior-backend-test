import express from 'express';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './services/auth';
import { orderRouter } from './services/orders';

const app = express();

// Body parsing
app.use(express.json());

// Request ID generation/propagation
app.use(requestIdMiddleware);

// Request logging
app.use(requestLoggerMiddleware);

// Routes
app.use('/auth', authRouter);
app.use('/orders', orderRouter);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export { app };
