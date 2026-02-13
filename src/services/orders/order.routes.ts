import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../infra/logger';
import { eventBus } from '../../infra/event-bus';
import { cache } from '../../infra/cache';
import { config } from '../../config';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { asyncHandler } from '../../middleware/error-handler';
import { UserRole } from '../auth/auth.types';
import { orderStore } from './order.store';
import { createOrderSchema } from './order.validation';
import { OrderStatus } from './order.types';
import type { Order } from './order.types';

const orderRouter = Router();

orderRouter.post(
  '/',
  authMiddleware,
  authorize(UserRole.CUSTOMER),
  asyncHandler(async (req, res) => {
    const body = createOrderSchema.parse(req.body);

    const now = new Date().toISOString();
    const order: Order = {
      id: uuidv4(),
      customerId: req.user!.userId,
      items: body.items,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    orderStore.save(order);

    logger.info({
      message: 'Order created',
      orderId: order.id,
      status: order.status,
    });

    eventBus.emit('order.created', {
      type: 'order.created',
      eventId: uuidv4(),
      orderId: order.id,
      timestamp: Date.now(),
      requestId: req.requestId,
      customerId: order.customerId,
      items: order.items,
    });

    res.status(201).json(order);
  })
);

orderRouter.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = req.user!;
    let orders: Order[];

    if (user.role === UserRole.ADMIN) {
      orders = orderStore.findAll();
    } else if (user.role === UserRole.BRAND) {
      orders = orderStore.findAll().filter((order) =>
        order.items.some((item) => item.productId.startsWith(user.brandId || ''))
      );
    } else {
      orders = orderStore.findByCustomerId(user.userId);
    }

    res.status(200).json(orders);
  })
);

orderRouter.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = req.user!;
    const cacheKey = `order:${id}`;

    const cached = cache.get<Order>(cacheKey);
    if (cached) {
      if (!canAccessOrder(user, cached)) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(200).json(cached);
      return;
    }

    const order = orderStore.findById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (!canAccessOrder(user, order)) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    cache.set(cacheKey, order, config.cacheTtlSeconds);
    res.status(200).json(order);
  })
);

function canAccessOrder(
  user: { role: string; userId: string; brandId?: string },
  order: Order
): boolean {
  if (user.role === UserRole.ADMIN) {
    return true;
  }
  if (user.role === UserRole.BRAND) {
    return order.items.some((item) => item.productId.startsWith(user.brandId || ''));
  }
  return order.customerId === user.userId;
}

export { orderRouter };
