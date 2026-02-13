import { app } from './app';
import { config } from './config';
import { logger } from './infra/logger';
import { eventBus } from './infra/event-bus';
import { cache } from './infra/cache';
import { registerOrderHandlers } from './services/orders';
import { orderStore } from './services/orders';
import { registerPaymentHandlers } from './services/payments';
import { registerStockHandlers } from './services/stock';
import { registerDeliveryHandlers } from './services/delivery';

// Register all event handlers
registerOrderHandlers(eventBus, orderStore, cache);
registerPaymentHandlers(eventBus);
registerStockHandlers(eventBus);
registerDeliveryHandlers(eventBus);

// Start server
const server = app.listen(config.port, () => {
  logger.info({ message: 'Server started', port: config.port });
});

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  logger.info({ message: `${signal} received, shutting down gracefully` });
  eventBus.removeAllListeners();
  server.close(() => {
    logger.info({ message: 'Server closed' });
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
