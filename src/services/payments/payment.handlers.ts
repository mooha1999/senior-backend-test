import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { logger } from '../../infra/logger';
import type { EventBus } from '../../infra/event-bus';

const processedEventIds = new Set<string>();

const processPayment = async (orderId: string, attempt: number): Promise<boolean> => {
  const success = Math.random() > (1 - config.paymentSuccessRate);
  logger.info({
    message: 'Payment attempt',
    orderId,
    attempt,
    maxAttempts: config.paymentMaxRetries,
    success,
  });
  return success;
};

const registerPaymentHandlers = (bus: EventBus): void => {
  bus.on('order.created', async (event) => {
    if (processedEventIds.has(event.eventId)) {
      logger.warn({ message: 'Duplicate event skipped', eventId: event.eventId, event: 'order.created' });
      return;
    }
    processedEventIds.add(event.eventId);

    let paid = false;

    for (let attempt = 1; attempt <= config.paymentMaxRetries; attempt++) {
      const success = await processPayment(event.orderId, attempt);

      if (success) {
        paid = true;
        const amount = event.items.length * 100;
        bus.emit('payment.success', {
          type: 'payment.success',
          eventId: uuidv4(),
          orderId: event.orderId,
          timestamp: Date.now(),
          requestId: event.requestId,
          amount,
        });
        break;
      }

      if (attempt < config.paymentMaxRetries) {
        await new Promise<void>((resolve) => setTimeout(resolve, config.paymentRetryBaseDelayMs * attempt));
      }
    }

    if (!paid) {
      bus.emit('payment.failed', {
        type: 'payment.failed',
        eventId: uuidv4(),
        orderId: event.orderId,
        timestamp: Date.now(),
        requestId: event.requestId,
        reason: `Payment declined after ${config.paymentMaxRetries} attempts`,
      });
    }
  });
};

export { registerPaymentHandlers };
