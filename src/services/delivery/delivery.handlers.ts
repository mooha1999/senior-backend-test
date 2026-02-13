import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../infra/logger';
import type { EventBus } from '../../infra/event-bus';

const processedEventIds = new Set<string>();

const registerDeliveryHandlers = (bus: EventBus): void => {
  bus.on('stock.updated', async (event) => {
    if (processedEventIds.has(event.eventId)) {
      logger.warn({ message: 'Duplicate event skipped', eventId: event.eventId, event: 'stock.updated' });
      return;
    }
    processedEventIds.add(event.eventId);

    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    logger.info({
      message: 'Delivery scheduled',
      orderId: event.orderId,
      estimatedDelivery,
    });

    bus.emit('delivery.scheduled', {
      type: 'delivery.scheduled',
      eventId: uuidv4(),
      orderId: event.orderId,
      timestamp: Date.now(),
      requestId: event.requestId,
      estimatedDelivery,
    });
  });
};

export { registerDeliveryHandlers };
