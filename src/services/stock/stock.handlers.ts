import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { logger } from '../../infra/logger';
import type { EventBus } from '../../infra/event-bus';

const processedEventIds = new Set<string>();

const registerStockHandlers = (bus: EventBus): void => {
  bus.on('payment.success', async (event) => {
    if (processedEventIds.has(event.eventId)) {
      logger.warn({ message: 'Duplicate event skipped', eventId: event.eventId, event: 'payment.success' });
      return;
    }
    processedEventIds.add(event.eventId);

    const success = Math.random() > (1 - config.stockSuccessRate);

    logger.info({
      message: 'Stock check',
      orderId: event.orderId,
      success,
    });

    if (success) {
      bus.emit('stock.updated', {
        type: 'stock.updated',
        eventId: uuidv4(),
        orderId: event.orderId,
        timestamp: Date.now(),
        requestId: event.requestId,
      });
    } else {
      bus.emit('stock.failed', {
        type: 'stock.failed',
        eventId: uuidv4(),
        orderId: event.orderId,
        timestamp: Date.now(),
        requestId: event.requestId,
        reason: 'Insufficient stock',
      });
    }
  });
};

export { registerStockHandlers };
