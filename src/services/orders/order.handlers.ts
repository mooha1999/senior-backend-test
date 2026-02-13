import { logger } from '../../infra/logger';
import type { EventBus } from '../../infra/event-bus';
import type { ICache } from '../../infra/cache';
import type { OrderStore } from './order.store';
import { OrderStatus } from './order.types';

const registerOrderHandlers = (bus: EventBus, store: OrderStore, cacheInstance: ICache): void => {
  bus.on('payment.success', async (event) => {
    const previous = store.findById(event.orderId);
    const order = store.updateStatus(event.orderId, OrderStatus.PAID);
    if (order) {
      cacheInstance.invalidate(`order:${event.orderId}`);
      logger.info({
        message: 'Order status updated',
        orderId: event.orderId,
        from: previous?.status,
        to: OrderStatus.PAID,
      });
    }
  });

  bus.on('payment.failed', async (event) => {
    const previous = store.findById(event.orderId);
    const order = store.updateStatus(event.orderId, OrderStatus.PAYMENT_FAILED);
    if (order) {
      cacheInstance.invalidate(`order:${event.orderId}`);
      logger.info({
        message: 'Order status updated',
        orderId: event.orderId,
        from: previous?.status,
        to: OrderStatus.PAYMENT_FAILED,
      });
    }
  });

  bus.on('stock.updated', async (event) => {
    const previous = store.findById(event.orderId);
    const order = store.updateStatus(event.orderId, OrderStatus.STOCK_CONFIRMED);
    if (order) {
      cacheInstance.invalidate(`order:${event.orderId}`);
      logger.info({
        message: 'Order status updated',
        orderId: event.orderId,
        from: previous?.status,
        to: OrderStatus.STOCK_CONFIRMED,
      });
    }
  });

  bus.on('stock.failed', async (event) => {
    const previous = store.findById(event.orderId);
    const order = store.updateStatus(event.orderId, OrderStatus.STOCK_FAILED);
    if (order) {
      cacheInstance.invalidate(`order:${event.orderId}`);
      logger.info({
        message: 'Order status updated',
        orderId: event.orderId,
        from: previous?.status,
        to: OrderStatus.STOCK_FAILED,
      });
    }
  });

  bus.on('delivery.scheduled', async (event) => {
    const previous = store.findById(event.orderId);
    const order = store.updateStatus(event.orderId, OrderStatus.COMPLETED);
    if (order) {
      cacheInstance.invalidate(`order:${event.orderId}`);
      logger.info({
        message: 'Order status updated',
        orderId: event.orderId,
        from: previous?.status,
        to: OrderStatus.COMPLETED,
      });
    }
  });
};

export { registerOrderHandlers };
